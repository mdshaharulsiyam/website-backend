import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import config from "../../DefaultConfig/config";
import { UnlinkFiles } from "../../middleware/fileUploader";
import hashText from "../../utils/hashText";
import { order_model } from "../Order/order_model";
import { shipping_address_model } from "../ShippingAddress/shipping_address_model";
import { verification_service } from "../Verification/verification_service";
import auth_model from "./auth_model";
import { IAuth } from "./auth_types";

type UserListQuery = {
  search?: string;
  status?: string;
};

type CustomerSummary = {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  img?: string;
  role: string;
  block: boolean;
  is_verified: boolean;
  is_identity_verified: boolean;
  use_type: string;
  provider: string;
  createdAt?: Date;
  updatedAt?: Date;
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function sign_up(data: { [key: string]: string }, auth?: IAuth) {
  const {
    role,
    is_verified,
    block,
    credits,
    is_identity_verified,
    accessToken,
    confirm_password,
    ...otherValues
  } = data;

  if (confirm_password != otherValues?.password)
    throw new Error(`confirm password doesn't match `);

  const user = await auth_model
    .findOne({ email: otherValues.email, is_verified: false })
    .lean();

  if (user) return await verification_service.create(user.email as string);

  await auth_model.create({
    ...otherValues,
    ...((auth?.role == "ADMIN" || auth?.role == "SUPER_ADMIN") && { role }),
  });

  return await verification_service.create(otherValues?.email as string);
}

async function sing_in(data: { [key: string]: string }) {
  const user = await auth_model.findOne({ email: data?.email });

  if (!user) throw new Error(`invalid credentials`);

  if (!user?.is_verified) throw new Error(`please verify your email`);

  const is_match_pass = await bcrypt.compare(data?.password, user?.password);

  if (!is_match_pass) throw new Error(`invalid credentials`);

  const token = await jwt.sign(
    { email: user?.email, id: user?._id, role: user?.role },
    config.ACCESS_TOKEN_SECRET || "",
    { expiresIn: 60 * 60 * 24 * 500 },
  );

  return {
    success: false,
    message: `login successfully`,
    email: user?.email,
    token,
  };
}

async function reset_password(data: { [key: string]: string }, auth: IAuth) {
  let { password, confirm_password } = data;

  if (password !== confirm_password)
    throw new Error(`confirm password doesn't match `);

  password = await hashText(password);

  const result = await auth_model.updateOne(
    { _id: auth?._id },
    {
      $set: {
        password,
        accessToken: "",
      },
    },
  );

  if (result.modifiedCount == 1) {
    const token = await jwt.sign(
      { email: auth?.email, id: auth?._id, role: auth?.role },
      config.ACCESS_TOKEN_SECRET || "",
      { expiresIn: 60 * 60 * 24 * 500 },
    );

    return {
      success: false,
      message: `password reset successfully`,
      data: {
        email: auth?.email,
        _id: auth?._id,
        role: auth?.role,
        name: auth?.name,
      },
      token: token,
    };
  } else {
    throw new Error(`unable to reset password`);
  }
}

async function change_password(data: { [key: string]: string }, auth: IAuth) {
  console.log(data);
  let { old_password } = data;

  const is_match_pass = await bcrypt.compare(old_password, auth?.password);

  if (!is_match_pass) throw new Error(`old password doesn't match `);

  return await reset_password(data, auth);
}

async function update_auth(
  data: {
    [key: string]: string | { [key: string]: string | boolean } | boolean;
  },
  auth: IAuth,
) {
  const result = await auth_model.updateOne(
    { _id: auth?._id },
    {
      $set: {
        ...data,
      },
    },
  );

  if (data?.img && auth?.img) UnlinkFiles([auth?.img]);
  if (
    Array.isArray(data?.documents) &&
    data?.documents?.length > 0 &&
    auth?.documents?.length > 0
  )
    UnlinkFiles(auth?.documents);

  return {
    success: true,
    message: "profile updated successfully",
    data: result,
  };
}

async function get_profile(auth: IAuth) {
  const { password, ...otherDetails } = auth;
  return {
    success: true,
    message: "profile fetched successfully",
    data: { ...otherDetails },
  };
}

async function get_all_users(query: UserListQuery = {}) {
  const match: Record<string, unknown> = { role: "USER" };

  if (query.status === "Active") match.block = false;
  if (query.status === "Banned") match.block = true;

  if (query.search) {
    const search = new RegExp(escapeRegex(query.search), "i");
    match.$or = [{ name: search }, { email: search }, { phone: search }];
  }

  const users = await auth_model
    .find(match)
    .select(
      "name email phone img role block is_verified is_identity_verified use_type provider createdAt updatedAt",
    )
    .sort({ createdAt: -1 })
    .lean<CustomerSummary[]>();

  const userIds = users.map((user) => user._id);

  const [orderStats, addresses] = await Promise.all([
    order_model.aggregate<{
      _id: Types.ObjectId;
      totalOrders: number;
      totalSpend: number;
      lastOrderAt?: Date;
    }>([
      { $match: { user: { $in: userIds } } },
      {
        $group: {
          _id: "$user",
          totalOrders: { $sum: 1 },
          totalSpend: { $sum: "$final_amount" },
          lastOrderAt: { $max: "$order_date" },
        },
      },
    ]),
    shipping_address_model
      .find({ user: { $in: userIds } })
      .select("user address city state zip phone full_name createdAt")
      .lean(),
  ]);

  const orderStatsByUser = new Map(
    orderStats.map((stat) => [stat._id.toString(), stat]),
  );

  const addressesByUser = new Map<string, typeof addresses>();
  addresses.forEach((address) => {
    const userId = address.user.toString();
    const list = addressesByUser.get(userId) ?? [];
    list.push(address);
    addressesByUser.set(userId, list);
  });

  const data = users.map((user) => {
    const id = user._id.toString();
    const stats = orderStatsByUser.get(id);
    const userAddresses = addressesByUser.get(id) ?? [];

    return {
      ...user,
      totalOrders: stats?.totalOrders ?? 0,
      totalSpend: stats?.totalSpend ?? 0,
      lastOrderAt: stats?.lastOrderAt ?? null,
      addressCount: userAddresses.length,
      addresses: userAddresses,
    };
  });

  return {
    success: true,
    message: "users fetched successfully",
    data,
    total: data.length,
  };
}

async function verify_identity(id: string) {
  const result = await auth_model.updateOne(
    { _id: id },
    {
      $set: {
        is_identity_verified: true,
      },
    },
  );
  if (result.modifiedCount == 1) {
    return {
      success: true,
      message: "identity verified successfully",
    };
  } else {
    throw new Error(`unable to verify identity`);
  }
}

async function block_auth(id: string) {
  const result = await auth_model.findOneAndUpdate(
    { _id: id },
    [
      {
        $set: {
          block: {
            $cond: {
              if: { $eq: ["$block", false] },
              then: true,
              else: false,
            },
          },
        },
      },
    ],
    { new: true },
  );
  return {
    success: true,
    message: `user ${result?.block ? "blocked" : "unblocked"} successfully`,
    data: result,
  };
}

export const auth_service = Object.freeze({
  sign_up,
  sing_in,
  change_password,
  update_auth,
  get_profile,
  get_all_users,
  verify_identity,
  block_auth,
  reset_password,
});
