import { Schema, model } from "mongoose";
import IShippingAddress from "./shipping_address_type";

const shipping_address_schema = new Schema<IShippingAddress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "auth",
      required: true,
    },
    address: {
      type: String,
      required: [true, "Street is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    zip: {
      type: String,
      required: [true, "Zip is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    full_name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        default: [0, 0],
        validate: {
          validator: function (value: number[]) {
            return value.length === 2;
          },
          message:
            "Coordinates must contain exactly two values: [longitude, latitude]",
        },
      },
    },
  },
  { timestamps: true },
);
shipping_address_schema.index({ location: "2dsphere" });
shipping_address_schema.index({ user: 1, address: 1 }, { unique: true })
export const shipping_address_model = model<IShippingAddress>(
  "shipping_address",
  shipping_address_schema,
);
