import { Schema, model } from "mongoose";
import { IFaq } from "./faq_types";

const faq_schema = new Schema<IFaq>(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: "General",
    },
  },
  { timestamps: true },
);

const faq_model = model<IFaq>("faq", faq_schema);
export default faq_model;
