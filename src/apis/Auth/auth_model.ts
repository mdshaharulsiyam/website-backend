import { CallbackError, Schema, model } from "mongoose";
import config from "../../DefaultConfig/config";
import hashText from "../../utils/hashText";
import { IAuth, IStripe } from "./auth_types";

const stripe_schema = new Schema<IStripe>(
  {
    stripe_account_id: {
      type: String,
      required: false,
      default: null,
    },
    is_account_complete: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  {
    _id: false,
  },
);

const auth_schema = new Schema<IAuth>(
  {
    name: {
      type: String,
      required: [true, " name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: false,
      default: null,
    },
    img: {
      type: String,
      required: false,
      default: null,
    },
    password: {
      type: String,
      required: function (this: IAuth) {
        return this.provider === "CREDENTIAL";
      },
      validate: [
        {
          validator: function (value: string) {
            return value && value.length >= 8 ? true : false;
          },
          message: "Password must be at most 8 characters long",
        },
        // {
        //   validator: function (value: string) {
        //     return !value || /[A-Z]/.test(value);
        //   },
        //   message: "Password must contain at least one uppercase letter",
        // },
      ],
      default: "",
    },
    role: {
      type: String,
      enum: config.USER,
      default: "USER",
    },
    block: {
      type: Boolean,
      default: false,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      enum: ["GOOGLE", "CREDENTIAL", "FACEBOOK", "GITHUB", "APPLE"],
      default: "CREDENTIAL",
    },
    accessToken: {
      type: String,
      default: "",
    },
    use_type: {
      type: String,
      enum: ["FREE", "BASIC", "PREMIUM"],
      default: "BASIC",
    },

    is_identity_verified: {
      type: Boolean,
      default: false,
    },
    documents: {
      type: [String],
      required: function (this: IAuth) {
        return this.role === "PROFESSIONAL";
      },
      validate: [
        {
          validator: function (value: string[]) {
            return (
              this.role !== "PROFESSIONAL" ||
              (Array.isArray(value) && value.length === 2)
            );
          },
          message:
            "Verification must have exactly two elements: [front, back] for PROFESSIONAL role only",
        },
        {
          validator: function (value: string[]) {
            return (
              this.role !== "PROFESSIONAL" ||
              value.every((v) => typeof v === "string" && v.trim() !== "")
            );
          },
          message:
            "Each verification element must be a non-empty string for PROFESSIONAL role only",
        },
      ],
    },
    stripe: {
      type: stripe_schema,
      default: null,
    },
    is_affiliate: {
      type: Boolean,
      default: false,
    },
    total_earnings: {
      type: Number,
      default: 0,
    },
    current_balance: {
      type: Number,
      default: 0,
    },
    withdrawn_amount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

auth_schema.pre("save", async function (next) {
  if (this && this.provider == "CREDENTIAL" && this.isModified("password")) {
    try {
      this.password = await hashText(this.password);
    } catch (error) {
      return next(error as CallbackError);
    }
  }
  next();
});
// Create the Auth model
const auth_model = model<IAuth>("auth", auth_schema);

export default auth_model;
