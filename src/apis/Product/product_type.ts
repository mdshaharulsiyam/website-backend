import { Document, Types } from "mongoose";

interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  discount?: number;
  coupon?: {
    available: boolean;
    coupon_code?: string;
  };
  img: string[];
  category: Types.ObjectId;
  sub_category: Types.ObjectId;
  stock: number;
  tag: string[];
  flag: "new" | "popular" | "trending" | "limited edition" | "featured" | "best choice" | "offer" | "limited stock";
  total_sold?: number;
  size?: string[];
  color?: string[];
  gender?: string;
  user: Types.ObjectId;
  is_deleted?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export default IProduct;
