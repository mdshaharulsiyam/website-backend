import { Document } from "mongoose";

export interface IDivisions extends Document {
  id: string;
  name: string;
  bn_name: string;
}
