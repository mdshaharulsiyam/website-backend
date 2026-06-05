import { Document, Schema } from "mongoose";

export interface ICity extends Document {
  name: string;
  state: Schema.Types.ObjectId;
}
