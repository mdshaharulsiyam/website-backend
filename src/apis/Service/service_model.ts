import { model, Schema } from "mongoose";
import { IService } from "./service_type";

const service_schema = new Schema<IService>(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      unique: true,
    },
    img: {
      type: String,
      required: [true, "img is required"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "category",
      required: [true, "category is required"],
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const service_model = model<IService>("service", service_schema);
