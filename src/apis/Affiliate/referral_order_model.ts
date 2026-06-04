import { Schema, model } from "mongoose";
import { IReferralOrder } from "./affiliate_types";

const referral_order_schema = new Schema<IReferralOrder>(
  {
    order_id: {
      type: Schema.Types.ObjectId,
      ref: "order",
      required: true,
    },
    affiliate_id: {
      type: Schema.Types.ObjectId,
      ref: "auth",
      required: true,
    },
    customer_id: {
      type: Schema.Types.ObjectId,
      ref: "auth",
      required: true,
    },
    commission_amount: {
      type: Number,
      required: true,
    },
    payment_status: {
      type: String,
      enum: ["Pending", "Approved", "Refunded"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

export const referral_order_model = model<IReferralOrder>("referral_order", referral_order_schema);
