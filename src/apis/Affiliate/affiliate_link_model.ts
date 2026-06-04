import { Schema, model } from "mongoose";
import { IAffiliateLink } from "./affiliate_types";

const affiliate_link_schema = new Schema<IAffiliateLink>(
  {
    affiliate_id: {
      type: Schema.Types.ObjectId,
      ref: "auth",
      required: true,
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const affiliate_link_model = model<IAffiliateLink>("affiliate_link", affiliate_link_schema);
