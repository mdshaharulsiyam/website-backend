import { Schema, model } from "mongoose";
import { IDivision } from "./division_types";

const division_schema = new Schema<IDivision>(
  {
    name: {
      type: String,
      required: [true, "Division name is required"],
      unique: true,
      trim: true,
    },
  },
  { timestamps: true },
);

const division_model = model<IDivision>("division", division_schema);
export default division_model;
