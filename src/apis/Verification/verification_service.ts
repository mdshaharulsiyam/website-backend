import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import config from "../../DefaultConfig/config";
import auth_model from "../Auth/auth_model";
import { verification_model } from "./verification_model";

async function create(email: string) {
  const user = await auth_model.findOne({ email: email });

  if (!user) throw new Error("User not found");

  const result = await verification_model
    .findOneAndUpdate(
      { email: email },
      { email: email },
      { new: true, upsert: true },
    )
    .lean();

  if (!result) throw new Error("unable to sent verification code");

  return {
    success: true,
    message: "a verification code has been sent to your email",
    data: { email },
  };
}

async function verify(data: { email: string; code: string }) {
  const session = await mongoose.startSession();
  try {
    const result = await session.withTransaction(async () => {
      const excitingVerification = await verification_model.findOne({
        email: data?.email,
        code: data?.code,
        updatedAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
      });

      if (!excitingVerification)
        throw new Error(`verification code not found or it may expired`);

      const accessToken = await jwt.sign(
        {
          email: data?.email,
          code: data?.code,
        },
        config.ACCESS_TOKEN_SECRET || "",
        { expiresIn: 5 * 60 },
      );

      const [result] = await Promise.all([
        auth_model.findOneAndUpdate(
          { email: data?.email },
          { accessToken: accessToken, is_verified: true },
          { new: true, session },
        ),

        verification_model.deleteMany({ email: data?.email }),
      ]);

      const token = await jwt.sign(
        { email: result?.email, id: result?._id, role: result?.role },
        config.ACCESS_TOKEN_SECRET || "",
        { expiresIn: 60 * 60 * 24 * 500 },
      );
      return {
        success: false,
        message: "email verified successfully",
        data: { email: result?.email, resetToken: accessToken, token: token },
      };
    });
    return result;
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
}

export const verification_service = Object.freeze({
  create,
  verify,
});
