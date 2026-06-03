import { Document } from "mongoose";

interface ICoupon extends Document {
  name: string;
  percentage: number;
  total_available: number;
  max_discount?: number;
  coupon_type: "product" | "all";
  created_at?: Date;
  updated_at?: Date;
}

export default ICoupon;
