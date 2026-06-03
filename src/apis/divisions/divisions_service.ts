import bcrypt from "bcrypt";
import mongoose from "mongoose";
import Aggregator from "../../utils/Aggregator";
import { QueryKeys, SearchKeys } from "../../utils/Queries";
import { IAuth } from "../Auth/auth_types";
import { service_model } from "../Service/service_model";
import { divisions_model } from "./divisions_model";

const create = async (data: { [key: string]: string }) => {
  const result = await divisions_model.create(data);
  return {
    success: true,
    message: "divisions created successfully",
    data: result,
  };
};

const get_all = async (queryKeys: QueryKeys, searchKeys: SearchKeys) => {
  return await Aggregator(divisions_model, queryKeys, searchKeys, [
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
  const result = await divisions_model.findByIdAndUpdate(
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
    message: "divisions updated successfully",
    data: result,
  };
};

const delete_divisions = async (
  id: string,
  data: { [key: string]: string },
  auth: IAuth,
) => {
  const is_exists = await divisions_model.findOne({
    _id: id,
    name: data?.name,
  });

  if (!is_exists) throw new Error("divisions not found");

  const is_pass_mass = await bcrypt.compare(data?.password, auth?.password);

  if (!is_pass_mass) throw new Error("password doesn't match");

  const session = await mongoose.startSession();
  try {
    const result = await session.withTransaction(async () => {
      const [result] = await Promise.all([
        divisions_model.findByIdAndDelete(id, { session }),
        service_model.deleteMany({ divisions: id }, { session }),
      ]);
      return result;
    });
    return {
      success: true,
      message: "divisions deleted successfully",
      data: result,
    };
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
};

export const divisions_service = Object.freeze({
  create,
  get_all,
  update,
  delete_divisions,
});
