import { model, Schema } from "mongoose";
import { IReview } from "./review_type";

const review_schema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "auth",
      required: [true, "user id is required"],
    },
    description: {
      type: String,
      required: [true, "description is required"],
    },
    rating: {
      type: Number,
      required: [true, "rating is required"],
      min: [1, "rating must be at least 1"],
      max: [5, "rating must be at most 5"],
    },

    product: {
      type: Schema.Types.ObjectId,
      ref: "product",
      required: function (this: IReview) {
        return this.review_for === "PRODUCT";
      },
      validate: [
        {
          validator: function (this: IReview) {
            if (this.review_for === "PRODUCT") {
              return this.product != null;
            }
            return true;
          },
          message: "product id is required",
        },
      ],
      enum: ["WEBSITE", "PRODUCT"],
      default: null,
    },
    img: {
      type: [String],
      default: [],
    },
    review_for: {
      type: String,
      enum: ["WEBSITE", "PRODUCT"],
      default: "WEBSITE",
    },
  },
  { timestamps: true },
);

export const review_model = model<IReview>("review", review_schema);
