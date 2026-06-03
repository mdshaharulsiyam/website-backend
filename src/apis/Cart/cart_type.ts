import { Document, Types } from "mongoose";


export interface ICart extends Document {
  user: Types.ObjectId;
  product_id: Types.ObjectId;
  quantity: number;
  color: string;
  size: string;
  _id: Types.ObjectId;
}
