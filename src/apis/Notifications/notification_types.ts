import { Document, Types } from "mongoose";

export type NotificationType = "email" | "sms" | "push";
export type NotificationSegment =
  | "all"
  | "Larva"
  | "Worker"
  | "Drone"
  | "Queen"
  | "Royal"
  | "new"
  | "returning";
export type NotificationCampaignStatus = "draft" | "sent" | "scheduled";
export type NotificationTemplateType = "email" | "sms";

export interface INotification extends Document {
  user?: Types.ObjectId;
  campaign?: Types.ObjectId;
  message: string;
  title: string;
  type?: NotificationType;
  read_by_admin?: boolean;
  read_by_user?: boolean;
}

export interface INotificationCampaign extends Document {
  title: string;
  body: string;
  type: NotificationType;
  segment: NotificationSegment;
  status: NotificationCampaignStatus;
  scheduledAt?: Date;
  sentAt?: Date;
  recipientCount: number;
  openRate?: number;
  createdBy?: Types.ObjectId;
}

export interface INotificationTemplate extends Document {
  name: string;
  trigger: string;
  type: NotificationTemplateType;
  subject?: string;
  body: string;
  isActive: boolean;
  lastModified: Date;
}
