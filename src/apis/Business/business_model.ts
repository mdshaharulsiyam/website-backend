import { Schema, model } from "mongoose";
import { IBusiness } from "./business_type";

const business_schema = new Schema<IBusiness>({
  user: {
    type: Schema.Types.ObjectId,
    required: [true, "User is required"],
    ref: "auth",
  },
  name: {
    type: String,
    required: [true, "Business name is required"],
  },
  logo: {
    type: String,
    default: null,
  },
  banner: {
    type: String,
    required: [true, "Business banner is required"],
  },
  address: {
    type: String,
    required: [true, "Business address is required"], //MultiMart FlexMart
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: [true, "Business coordinates are required"],
      validate: {
        validator: function (value: [number, number]) {
          return value.length === 2;
        },
        message:
          "Coordinates must contain exactly two values: [longitude, latitude]",
      },
      default: [0, 0],
    },
  },
  block: {
    type: Boolean,
    default: false,
  },
  is_approve: {
    type: Boolean,
    default: false,
  },
  trade_license: {
    type: String,
    default: null,
  },
  business_category: {
    type: String,
    enum: [
      "salon",
      "restaurant",
      "medical",
      "fitness",
      "shop",
      "real_estate",
      "services",
      "other",
    ],
    required: [true, "Business category is required"],
  },
  business_sub_admins: {
    type: [Schema.Types.ObjectId],
    ref: "auth",
    default: [],
  },
  business_documents: {
    type: [String],
    default: [],
  },
});

business_schema.index({ location: "2dsphere" });

export const business_model = model<IBusiness>("business", business_schema);
