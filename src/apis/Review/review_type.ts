import { Document, Types } from "mongoose";

export interface IReview extends Document {
  user: Types.ObjectId;
  description: string;
  rating: number;
  product: Types.ObjectId;
  img: string[];
  review_for: "WEBSITE" | "PRODUCT";
}
