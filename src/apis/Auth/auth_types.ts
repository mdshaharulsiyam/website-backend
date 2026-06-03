import { Document } from "mongoose";

export interface IStripe {
  stripe_account_id: string;
  is_account_complete: boolean;
}
export interface IAuth extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  img: string;
  role:
    | "ADMIN"
    | "SUPER_ADMIN"
    | "PROFESSIONAL"
    | "PROFESSIONAL"
    | "RIDER"
    | "VENDOR"
    | "USER";
  block: boolean;
  provider: "GOOGLE" | "CREDENTIAL" | "FACEBOOK" | "GITHUB" | "APPLE";
  is_verified: boolean;
  accessToken: string;
  use_type: "FREE" | "BASIC" | "PREMIUM";
  documents: string[];
  is_identity_verified: boolean;
  stripe: IStripe;
  createdAt: Date;
  updatedAt: Date;
}
