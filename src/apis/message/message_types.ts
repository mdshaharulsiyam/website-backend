import { Document, Types } from "mongoose";

export interface IMessage extends Document {
  conversation_id: Types.ObjectId;
  message: String;
  img: String;
  sender: Types.ObjectId;
}
