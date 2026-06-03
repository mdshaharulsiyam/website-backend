import { Schema, model } from "mongoose";
import { IBanner } from "./banner_type";

const banner_schema = new Schema<IBanner>(
  {
    img: {
      type: String,
      required: [true, "Banner image URL is required"],
    },
    link: {
      type: String,
      required: false,
      trim: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    offer: {
      type: String,
      required: true,
      maxlength: 30,
    },
    heading: {
      type: String,
      required: true,
      maxlength: 50,
    },
    description: {
      type: String,
      required: true,
      maxlength: 80,
    },
    button: {
      type: String,
      required: true,
      maxlength: 20,
    },
    start_date: {
      type: Date,
      required: false,
    },
    end_date: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true },
);

export const banner_model = model<IBanner>("banner", banner_schema);
