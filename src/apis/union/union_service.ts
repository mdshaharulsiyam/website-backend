import bcrypt from "bcrypt";
import mongoose from "mongoose";
import Aggregator from "../../utils/Aggregator";
import { QueryKeys, SearchKeys } from "../../utils/Queries";
import { IAuth } from "../Auth/auth_types";
import { service_model } from "../Service/service_model";
import { union_model } from "./union_model";
const create = async (data: { [key: string]: string }) => {
  const result = await union_model.create(data);
  return {
    success: true,
    message: "union created successfully",
    data: result,
  };
};

const get_all = async (queryKeys: QueryKeys, searchKeys: SearchKeys) => {
  return await Aggregator(union_model, queryKeys, searchKeys, [
    {
      $project: {
        name: 1,
        _id: 1,
        id: 1,
      },
    },
  ]);
};

const update = async (id: string, data: { [key: string]: string }) => {
  const result = await union_model.findByIdAndUpdate(
    id,
    {
      $set: {
        ...data,
      },
    },
    { new: true },
  );

  return {
    success: true,
    message: "union updated successfully",
    data: result,
  };
};

const delete_union = async (
  id: string,
  data: { [key: string]: string },
  auth: IAuth,
) => {
  const is_exists = await union_model.findOne({ _id: id, name: data?.name });

  if (!is_exists) throw new Error("union not found");

  const is_pass_mass = await bcrypt.compare(data?.password, auth?.password);

  if (!is_pass_mass) throw new Error("password doesn't match");

  const session = await mongoose.startSession();
  try {
    const result = await session.withTransaction(async () => {
      const [result] = await Promise.all([
        union_model.findByIdAndDelete(id, { session }),
        service_model.deleteMany({ union: id }, { session }),
      ]);
      return result;
    });
    return {
      success: true,
      message: "union deleted successfully",
      data: result,
    };
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
};

export const union_service = Object.freeze({
  create,
  get_all,
  update,
  delete_union,
});
