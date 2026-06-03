import { model, Schema } from "mongoose";
import { IConversation } from "./conversation_types";

const conversation_schema = new Schema<IConversation>(
  {
    users: {
      type: [Schema.Types.ObjectId],
      required: [true, "name is required"],
      ref: "auth",
      validate: {
        validator: function (v: any) {
          return v.length >= 2;
        },
        message: "At least 2 users are required",
      },
      unique: true,
    },
  },
  { timestamps: true },
);

export const conversation_model = model<IConversation>(
  "conversation",
  conversation_schema,
);
