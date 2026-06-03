import { model, Schema } from "mongoose";
import { IDistricts } from "./districts_types";

const districts_schema = new Schema<IDistricts>(
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
    division_id: {
      type: Number,
      required: [true, "division_id is required"],
    },
    bn_name: {
      type: String,
      required: [true, "bn_name is required"],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: [true, "District coordinates are required"],
        validate: {
          validator: function (v: any) {
            return v.length === 2;
          },
          message:
            "Coordinates must contain exactly two values: [longitude, latitude]",
        },
        default: [0, 0],
      },
    },
  },
  { timestamps: true },
);
districts_schema.index({ location: "2dsphere" });
export const districts_model = model<IDistricts>("districts", districts_schema);
