import bcrypt from "bcrypt";
import mongoose from "mongoose";
import Aggregator from "../../utils/Aggregator";
import { QueryKeys, SearchKeys } from "../../utils/Queries";
import { IAuth } from "../Auth/auth_types";
import { service_model } from "../Service/service_model";
import { upazilas_model } from "./upazilas_model";
const create = async (data: { [key: string]: string }) => {
  const result = await upazilas_model.create(data);
  return {
    success: true,
    message: "upazilas created successfully",
    data: result,
  };
};

const get_all = async (queryKeys: QueryKeys, searchKeys: SearchKeys) => {
  return await Aggregator(upazilas_model, queryKeys, searchKeys, [
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
  const result = await upazilas_model.findByIdAndUpdate(
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
    message: "upazilas updated successfully",
    data: result,
  };
};

const delete_upazilas = async (
  id: string,
  data: { [key: string]: string },
  auth: IAuth,
) => {
  const is_exists = await upazilas_model.findOne({ _id: id, name: data?.name });

  if (!is_exists) throw new Error("upazilas not found");

  const is_pass_mass = await bcrypt.compare(data?.password, auth?.password);

  if (!is_pass_mass) throw new Error("password doesn't match");

  const session = await mongoose.startSession();
  try {
    const result = await session.withTransaction(async () => {
      const [result] = await Promise.all([
        upazilas_model.findByIdAndDelete(id, { session }),
        service_model.deleteMany({ upazilas: id }, { session }),
      ]);
      return result;
    });
    return {
      success: true,
      message: "upazilas deleted successfully",
      data: result,
    };
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
};

export const upazilas_service = Object.freeze({
  create,
  get_all,
  update,
  delete_upazilas,
});
