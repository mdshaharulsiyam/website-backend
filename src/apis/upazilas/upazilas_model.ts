import { model, Schema } from "mongoose";
import { IUpazilas } from "./upazilas_types";

const upazilas_schema = new Schema<IUpazilas>(
  {
    id: {
      type: String,
      required: [true, "id is required"],
      unique: true,
    },
    district_id: {
      type: Number,
      required: [true, "district_id is required"],
    },
    name: {
      type: String,
      required: [true, "name is required"],
      // unique: true
    },
    bn_name: {
      type: String,
      required: [true, "bn_name is required"],
      // unique: true
    },
    location: {
      type: {
        type: String,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: [true, "Coordinates are required"],
        default: [0, 0],
      },
    },
  },
  { timestamps: true },
);

upazilas_schema.index({ location: "2dsphere" });
upazilas_schema.index({ district_id: 1 });
upazilas_schema.index({ id: 1 });

export const upazilas_model = model<IUpazilas>("upazilas", upazilas_schema);
