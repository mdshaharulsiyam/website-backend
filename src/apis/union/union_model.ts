import { model, Schema } from "mongoose";
import { IUnion } from "./union_types";

const union_schema = new Schema<IUnion>(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    upazilla_id: {
      type: Number,
      required: [true, "upazilla_id is required"],
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
    id: {
      type: String,
      required: [true, "id is required"],
      unique: true,
    },
    bn_name: {
      type: String,
      required: [true, "bn_name is required"],
    },
  },
  { timestamps: true },
);

union_schema.index({ location: "2dsphere" });
union_schema.index({ upazilla_id: 1 });
union_schema.index({ id: 1 });

export const union_model = model<IUnion>("union", union_schema);
