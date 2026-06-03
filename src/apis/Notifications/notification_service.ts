import { Types } from "mongoose";
import Queries, { QueryKeys, SearchKeys } from "../../utils/Queries";
import { emitNotificationToUsers } from "../../socket";
import auth_model from "../Auth/auth_model";
import { IAuth } from "../Auth/auth_types";
import { order_model } from "../Order/order_model";
import {
  notification_campaign_model,
  notification_model,
  notification_template_model,
} from "./notification_model";
import {
  INotification,
  INotificationCampaign,
  INotificationTemplate,
  NotificationCampaignStatus,
  NotificationSegment,
  NotificationTemplateType,
} from "./notification_types";

const DEFAULT_TEMPLATES: Array<
  Pick<
    INotificationTemplate,
    "name" | "trigger" | "type" | "subject" | "body" | "isActive"
  >
> = [
  {
    name: "Order Confirmation",
    trigger: "order.placed",
    type: "email",
    subject: "Your LooksBee order #{{orderId}} is confirmed",
    body: "Hi {{customerName}},\n\nYour order #{{orderId}} has been confirmed. Total: {{total}}.",
    isActive: true,
  },
  {
    name: "Order Shipped",
    trigger: "order.shipped",
    type: "email",
    subject: "Your LooksBee order is on the way",
    body: "Hi {{customerName}},\n\nYour order #{{orderId}} has shipped. Tracking: {{trackingNumber}}.",
    isActive: true,
  },
  {
    name: "Order Delivered",
    trigger: "order.delivered",
    type: "email",
    subject: "Your LooksBee order has been delivered",
    body: "Hi {{customerName}},\n\nYour order #{{orderId}} was delivered successfully.",
    isActive: true,
  },
  {
    name: "Refund Processed",
    trigger: "order.refunded",
    type: "email",
    subject: "Refund processed for order #{{orderId}}",
    body: "Hi {{customerName}},\n\nYour refund of {{amount}} has been processed.",
    isActive: true,
  },
  {
    name: "OTP",
    trigger: "auth.otp",
    type: "sms",
    body: "Your LooksBee OTP is {{otp}}. Valid for 5 minutes. Do not share.",
    isActive: true,
  },
  {
    name: "Order Confirmed",
    trigger: "order.placed",
    type: "sms",
    body: "Hi {{name}}, your order #{{orderId}} ({{total}}) is confirmed.",
    isActive: true,
  },
  {
    name: "Order Shipped",
    trigger: "order.shipped",
    type: "sms",
    body: "Hi {{name}}, your order #{{orderId}} shipped. Tracking: {{trackingNumber}}.",
    isActive: true,
  },
];

const BEE_LEVEL_RANGES: Record<
  Exclude<NotificationSegment, "all" | "new" | "returning">,
  { min: number; max?: number }
> = {
  Larva: { min: 0, max: 2 },
  Worker: { min: 3, max: 7 },
  Drone: { min: 8, max: 19 },
  Queen: { min: 20, max: 49 },
  Royal: { min: 50 },
};

function emit_inserted_notifications<T extends { user?: { toString(): string } | string | null }>(
  notifications: T[],
) {
  notifications.forEach((notification) => {
    const userId = notification.user?.toString();
    if (userId) emitNotificationToUsers([userId], notification);
  });
}

async function create(data: INotification | INotification[]) {
  const docs = Array.isArray(data) ? data : [data];
  const result = await notification_model.insertMany(docs);
  emit_inserted_notifications(result);
  return {
    success: true,
    message: "notification created successfully",
    data: result,
  };
}

async function ensure_default_templates() {
  await Promise.all(
    DEFAULT_TEMPLATES.map((template) =>
      notification_template_model.updateOne(
        { type: template.type, trigger: template.trigger },
        {
          $setOnInsert: {
            ...template,
            lastModified: new Date(),
          },
        },
        { upsert: true },
      ),
    ),
  );
}

async function get_all(
  queryKeys: QueryKeys,
  searchKeys: SearchKeys,
  populatePath?: any,
  selectFields?: string | string[],
  modelSelect?: string,
) {
  await dispatch_due_campaigns();

  return await Queries(
    notification_model,
    queryKeys,
    searchKeys,
    populatePath,
    selectFields,
    modelSelect,
  );
}

async function get_recipient_ids(segment: NotificationSegment) {
  const baseUserQuery = { role: "USER", block: false };

  if (segment === "all") {
    const users = await auth_model.find(baseUserQuery).select("_id").lean();
    return users.map((user) => user._id as Types.ObjectId);
  }

  if (segment === "new") {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const users = await auth_model
      .find({ ...baseUserQuery, createdAt: { $gte: since } })
      .select("_id")
      .lean();
    return users.map((user) => user._id as Types.ObjectId);
  }

  if (segment === "returning") {
    const orderedUsers = await order_model.distinct("user");
    const users = await auth_model
      .find({ ...baseUserQuery, _id: { $in: orderedUsers } })
      .select("_id")
      .lean();
    return users.map((user) => user._id as Types.ObjectId);
  }

  const range = BEE_LEVEL_RANGES[segment];
  const users = await auth_model.find(baseUserQuery).select("_id").lean();
  const userIds = users.map((user) => user._id as Types.ObjectId);
  const orderCounts = await order_model.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { user: { $in: userIds } } },
    { $group: { _id: "$user", count: { $sum: 1 } } },
  ]);
  const countByUser = new Map(orderCounts.map((item) => [item._id.toString(), item.count]));

  return userIds.filter((userId) => {
    const count = countByUser.get(userId.toString()) ?? 0;
    return count >= range.min && (range.max === undefined || count <= range.max);
  });
}

async function dispatch_campaign(campaign: INotificationCampaign) {
  const recipients = await get_recipient_ids(campaign.segment);

  if (recipients.length > 0) {
    const notifications = await notification_model.insertMany(
      recipients.map((user) => ({
        user,
        campaign: campaign._id,
        title: campaign.title,
        message: campaign.body,
        type: campaign.type,
      })),
    );
    emit_inserted_notifications(notifications);
  }

  await notification_campaign_model.updateOne(
    { _id: campaign._id, status: "scheduled" },
    {
      $set: {
        status: "sent",
        sentAt: new Date(),
        recipientCount: recipients.length,
      },
    },
  );
}

async function dispatch_due_campaigns() {
  const dueCampaigns = await notification_campaign_model.find({
    status: "scheduled",
    scheduledAt: { $lte: new Date() },
  });

  await Promise.all(dueCampaigns.map((campaign) => dispatch_campaign(campaign)));
}

async function create_campaign(
  data: Pick<INotificationCampaign, "title" | "body" | "type" | "segment"> & {
    scheduledAt?: string | Date;
  },
  auth: IAuth,
) {
  if (!data.title?.trim()) throw new Error("campaign title is required");
  if (!data.body?.trim()) throw new Error("campaign body is required");
  if (data.body.length > 500) throw new Error("campaign body must be 500 characters or less");

  const recipients = await get_recipient_ids(data.segment ?? "all");
  const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : undefined;
  const status: NotificationCampaignStatus =
    scheduledAt && scheduledAt > new Date() ? "scheduled" : "sent";
  const sentAt = status === "sent" ? new Date() : undefined;

  const campaign = await notification_campaign_model.create({
    title: data.title.trim(),
    body: data.body.trim(),
    type: data.type,
    segment: data.segment ?? "all",
    status,
    scheduledAt,
    sentAt,
    recipientCount: recipients.length,
    openRate: 0,
    createdBy: auth?._id,
  });

  if (status === "sent" && recipients.length > 0) {
    const notifications = await notification_model.insertMany(
      recipients.map((user) => ({
        user,
        campaign: campaign._id,
        title: campaign.title,
        message: campaign.body,
        type: campaign.type,
      })),
    );
    emit_inserted_notifications(notifications);
  }

  return {
    success: true,
    message: status === "scheduled" ? "campaign scheduled successfully" : "campaign sent successfully",
    data: campaign,
  };
}

async function send_user_notification(
  userId: string,
  data: Pick<INotification, "title" | "message" | "type">,
) {
  if (!data.title?.trim()) throw new Error("notification title is required");
  if (!data.message?.trim()) throw new Error("notification message is required");

  const user = await auth_model.findById(userId).select("_id").lean();
  if (!user) throw new Error("user not found");

  const [notification] = await notification_model.insertMany([
    {
      user: user._id,
      title: data.title.trim(),
      message: data.message.trim(),
      type: data.type ?? "push",
    },
  ]);

  emitNotificationToUsers([user._id.toString()], notification);

  return {
    success: true,
    message: "notification sent successfully",
    data: notification,
  };
}

async function get_unread_count(user: IAuth) {
  await dispatch_due_campaigns();

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const count = await notification_model.countDocuments(
    isAdmin ? { read_by_admin: false } : { user: user?._id, read_by_user: false },
  );

  return {
    success: true,
    message: "unread notifications counted successfully",
    data: { count },
  };
}

async function read_all_notifications(user: IAuth) {
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const result = await notification_model.updateMany(
    isAdmin ? { read_by_admin: false } : { user: user?._id, read_by_user: false },
    {
      $set: isAdmin ? { read_by_admin: true } : { read_by_user: true },
    },
  );

  return {
    success: true,
    message: "notifications marked as read",
    data: result,
  };
}

async function get_campaigns(query: QueryKeys, search?: string) {
  await dispatch_due_campaigns();

  const filter: Record<string, unknown> = {};

  if (query.type) filter.type = query.type;
  if (query.status) filter.status = query.status;
  if (query.segment) filter.segment = query.segment;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { body: { $regex: search, $options: "i" } },
    ];
  }

  const data = await notification_campaign_model
    .find(filter)
    .sort({ createdAt: -1 })
    .populate({ path: "createdBy", select: "name email" })
    .lean();

  return {
    success: true,
    message: "campaigns fetched successfully",
    data,
  };
}

async function get_templates(type?: NotificationTemplateType) {
  await ensure_default_templates();
  const data = await notification_template_model
    .find(type ? { type } : {})
    .sort({ type: 1, name: 1 })
    .lean();

  return {
    success: true,
    message: "templates fetched successfully",
    data,
  };
}

async function update_template(id: string, data: Partial<INotificationTemplate>) {
  const { type, trigger, ...editable } = data;
  const result = await notification_template_model.findByIdAndUpdate(
    id,
    {
      $set: {
        ...editable,
        lastModified: new Date(),
      },
    },
    { new: true },
  );

  if (!result) throw new Error("template not found");

  return {
    success: true,
    message: "template updated successfully",
    data: result,
  };
}

async function toggle_template(id: string) {
  const template = await notification_template_model.findById(id);
  if (!template) throw new Error("template not found");

  template.isActive = !template.isActive;
  template.lastModified = new Date();
  await template.save();

  return {
    success: true,
    message: `template ${template.isActive ? "enabled" : "disabled"} successfully`,
    data: template,
  };
}

async function read_notification(id: string, user: IAuth) {
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const result = await notification_model.findOneAndUpdate(
    isAdmin ? { _id: id } : { _id: id, user: user?._id },
    {
      $set: isAdmin ? { read_by_admin: true } : { read_by_user: true },
    },
    { new: true },
  );

  if (!result) throw new Error("notification not found");

  return {
    success: true,
    message: "notification marked as read",
    data: result,
  };
}

export const notification_service = Object.freeze({
  create,
  get_all,
  create_campaign,
  get_campaigns,
  get_templates,
  send_user_notification,
  get_unread_count,
  read_all_notifications,
  update_template,
  toggle_template,
  read_notification,
});
