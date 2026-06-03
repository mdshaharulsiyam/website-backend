import { model, Schema } from "mongoose";
import { IDivisions } from "./divisions_types";

const divisions_schema = new Schema<IDivisions>(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      unique: true,
    },
    id: {
      type: String,
      required: [true, "id is required"],
    },
    bn_name: {
      type: String,
      required: [true, "bn_name is required"],
    },
  },
  { timestamps: true },
);

export const divisions_model = model<IDivisions>("divisions", divisions_schema);
