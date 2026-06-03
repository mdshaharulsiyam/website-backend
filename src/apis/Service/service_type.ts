import { Document, Types } from "mongoose";

export interface IService extends Document {
  name: string;
  img: string;
  category: Types.ObjectId;
  is_active: boolean;
}
