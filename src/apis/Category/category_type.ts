import { Document, Types } from "mongoose";

export interface ICategory extends Document {
  name: string;
  img: string;
  is_active: boolean;
}
