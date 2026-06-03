import { model, Schema } from "mongoose";
import { ICategory } from "./category_type";

const category_schema = new Schema<ICategory>(
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
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const category_model = model<ICategory>("category", category_schema);
