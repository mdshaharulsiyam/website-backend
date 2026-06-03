import mongoose, { model } from "mongoose";
import Queries, { QueryKeys, SearchKeys } from "../../utils/Queries";
import { conversation_model } from "./conversation_model";
import { service_model } from "../Service/service_model";
import { IAuth } from "../Auth/auth_types";
import bcrypt from "bcrypt";
import Aggregator from "../../utils/Aggregator";
import { IConversation } from "./conversation_types";

async function create(data: any) {
  const result = await conversation_model.create(data);
  return {
    success: true,
    message: "conversation created successfully",
    data: result,
  };
}

async function get_all(
  queryKeys: QueryKeys,
  searchKeys: SearchKeys,
  populatePath?: any,
  selectFields?: string | string[],
  modelSelect?: string,
) {
  return await Queries(
    conversation_model,
    queryKeys,
    searchKeys,
    populatePath,
    selectFields,
    modelSelect,
  );
}

async function update(id: string, data: { [key: string]: string }) {
  const result = await conversation_model.findByIdAndUpdate(
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
    message: "conversation updated successfully",
    data: result,
  };
}

async function delete_conversation(
  id: string,
  data: { [key: string]: string },
  auth: IAuth,
) {
  const is_exists = await conversation_model.findOne({
    _id: id,
    name: data?.name,
  });

  if (!is_exists) throw new Error("conversation not found");

  const is_pass_mass = await bcrypt.compare(data?.password, auth?.password);

  if (!is_pass_mass) throw new Error("password doesn't match");

  const session = await mongoose.startSession();
  try {
    const result = await session.withTransaction(async () => {
      const [result] = await Promise.all([
        conversation_model.findByIdAndDelete(id, { session }),
        service_model.deleteMany({ conversation: id }, { session }),
      ]);
      return result;
    });
    return {
      success: true,
      message: "conversation deleted successfully",
      data: result,
    };
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
}

export const conversation_service = Object.freeze({
  create,
  get_all,
  update,
  delete_conversation,
});
