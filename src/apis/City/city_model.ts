import { Schema, model } from "mongoose";
import { ICity } from "./city_types";

const city_schema = new Schema<ICity>(
  {
    name: {
      type: String,
      required: [true, "City name is required"],
      unique: true,
      trim: true,
    },
    state: {
      type: Schema.Types.ObjectId,
      ref: "state",
      required: [true, "State id is required"],
    },
  },
  { timestamps: true },
);

const city_model = model<ICity>("city", city_schema);
export default city_model;
