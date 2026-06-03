import { Document, Types } from "mongoose";

export interface IOrderItem {
  product: Types.ObjectId;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
  total_price: number;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  items: IOrderItem[];
  total_amount: number;
  discount: number;
  coupon?: string;
  final_amount: number;
  coupon_applied: boolean;
  payment_status?: "pending" | "paid" | "failed" | "refunded";
  payment_method?:
  | "credit_card"
  | "paypal"
  | "bank_transfer"
  | "cash_on_delivery";
  delivery_status?:
  | "pending"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "canceled"
  | "returned";
  delivery_address: Types.ObjectId;
  estimated_delivery_date?: Date;
  delivered_at?: Date;
  order_date?: Date;
  canceled_at?: Date;
  notes?: string;
}
