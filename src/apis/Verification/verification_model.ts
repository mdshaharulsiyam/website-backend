import { CallbackError, model, Schema } from "mongoose";
import { IVerification } from "./verification_type";
import { sendMail } from "../../utils/sendMail";

const verification_schema = new Schema<IVerification>(
  {
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      lowercase: true,
    },

    code: {
      type: String,
      required: [true, "code is required"],
    },
  },
  { timestamps: true },
);
verification_schema.pre("save", async function (next) {
  try {
    this.code = Math.round(100000 + Math.random() * 900000).toString();
    sendMail.sendVerificationMail(
      this.email,
      "email verification code",
      "user",
      this.code,
    );
    next();
  } catch (err) {
    next(err as CallbackError);
  }
});

verification_schema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate() as { email: string; code?: string };
    update.code = Math.round(100000 + Math.random() * 900000).toString();
    sendMail.sendVerificationMail(
      update.email,
      "email verification code",
      "user",
      update.code,
    );
    next();
  } catch (err) {
    next(err as CallbackError);
  }
});

export const verification_model = model<IVerification>(
  "verification",
  verification_schema,
);
