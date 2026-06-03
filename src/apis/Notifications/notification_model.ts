import { model, Schema } from "mongoose";
import {
  INotification,
  INotificationCampaign,
  INotificationTemplate,
} from "./notification_types";

const notification_schema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "auth",
    },
    campaign: {
      type: Schema.Types.ObjectId,
      ref: "notification_campaign",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["email", "sms", "push"],
      default: "push",
    },
    read_by_admin: {
      type: Boolean,
      default: false,
    },
    read_by_user: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const notification_campaign_schema = new Schema<INotificationCampaign>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ["email", "sms", "push"],
      required: true,
    },
    segment: {
      type: String,
      enum: ["all", "Larva", "Worker", "Drone", "Queen", "Royal", "new", "returning"],
      default: "all",
    },
    status: {
      type: String,
      enum: ["draft", "sent", "scheduled"],
      default: "sent",
    },
    scheduledAt: {
      type: Date,
    },
    sentAt: {
      type: Date,
    },
    recipientCount: {
      type: Number,
      default: 0,
    },
    openRate: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "auth",
    },
  },
  { timestamps: true },
);

const notification_template_schema = new Schema<INotificationTemplate>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    trigger: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["email", "sms"],
      required: true,
    },
    subject: {
      type: String,
      trim: true,
      default: "",
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

notification_schema.index({ user: 1, createdAt: -1 });
notification_campaign_schema.index({ createdAt: -1 });
notification_template_schema.index({ type: 1, trigger: 1 }, { unique: true });

export const notification_model = model<INotification>(
  "notification",
  notification_schema,
);

export const notification_campaign_model = model<INotificationCampaign>(
  "notification_campaign",
  notification_campaign_schema,
);

export const notification_template_model = model<INotificationTemplate>(
  "notification_template",
  notification_template_schema,
);
