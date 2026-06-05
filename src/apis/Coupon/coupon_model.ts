import { Schema, model } from "mongoose";
import ICoupon from "./coupon_type";
const coupon_schema = new Schema<ICoupon>(
  {
    name: {
      type: String,
      required: [true, "Coupon name is required"],
    },
    percentage: {
      type: Number,
      required: [true, "Percentage is required"],
      min: 0,
      max: 100,
    },
    coupon_type: {
      type: String,
      enum: ["product", "all"],
      default: "all",
    },
    max_discount: {
      type: Number,
      default: 0,
    },
    min_spend: {
      type: Number,
      default: 0,
    },
    total_available: {
      type: Number,
      required: [true, "Total available is required"],
      min: 1,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

export const coupon_model = model<ICoupon>("coupon", coupon_schema);
