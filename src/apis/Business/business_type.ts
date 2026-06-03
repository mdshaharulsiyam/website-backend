import { Document, Types } from "mongoose";

export interface IBusiness extends Document {
  user: Types.ObjectId;
  name: string;
  logo: string | null;
  banner: string;
  address: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  block: boolean;
  is_approve: boolean;
  trade_license: string | null;
  business_category:
    | "salon"
    | "restaurant"
    | "medical"
    | "fitness"
    | "shop"
    | "real_estate"
    | "services"
    | "other";
  business_sub_admins: Types.ObjectId[];
  business_documents: string[];
}
