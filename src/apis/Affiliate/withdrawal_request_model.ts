import { Schema, model } from "mongoose";
import { IWithdrawalRequest } from "./affiliate_types";

const withdrawal_request_schema = new Schema<IWithdrawalRequest>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "auth",
      required: true,
    },
    bkash_number: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Completed", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

export const withdrawal_request_model = model<IWithdrawalRequest>("withdrawal_request", withdrawal_request_schema);
