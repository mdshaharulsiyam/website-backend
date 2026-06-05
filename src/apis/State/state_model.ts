import { Schema, model } from "mongoose";
import { IState } from "./state_types";

const state_schema = new Schema<IState>(
  {
    name: {
      type: String,
      required: [true, "State name is required"],
      unique: true,
      trim: true,
    },
  },
  { timestamps: true },
);

const state_model = model<IState>("state", state_schema);
export default state_model;
