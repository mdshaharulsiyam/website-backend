import { Document, Types } from "mongoose";

export interface IReferralOrder extends Document {
  order_id: Types.ObjectId;
  affiliate_id: Types.ObjectId;
  customer_id: Types.ObjectId;
  commission_amount: number;
  payment_status: "Pending" | "Approved" | "Refunded";
  createdAt: Date;
  updatedAt: Date;
}

export interface IWithdrawalRequest extends Document {
  user_id: Types.ObjectId;
  bkash_number: string;
  amount: number;
  status: "Pending" | "Processing" | "Completed" | "Rejected";
  createdAt: Date;
  updatedAt: Date;
}

export interface IAffiliateLink extends Document {
  affiliate_id: Types.ObjectId;
  product_id: Types.ObjectId;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}
