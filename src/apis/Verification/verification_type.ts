import { Document } from "mongoose";

export interface IVerification extends Document {
  email: string;
  code: string;
}
