import { model, Schema } from "mongoose";
import { IMessage } from "./message_types";

const message_schema = new Schema<IMessage>(
  {
    conversation_id: {
      type: Schema.Types.ObjectId,
      required: [true, "conversation id is required"],
      ref: "conversation",
    },
    message: {
      type: String,
      required: [
        function () {
          return !this.img;
        },
        "image or message is required.",
      ],
    },
    img: {
      type: String,
      required: [
        function () {
          return !this.message;
        },
        "",
      ],
    },
    sender: {
      type: Schema.Types.ObjectId,
      required: [true, "sender id is required"],
      ref: "auth",
    },
  },
  { timestamps: true },
);

export const message_model = model<IMessage>("message", message_schema);
