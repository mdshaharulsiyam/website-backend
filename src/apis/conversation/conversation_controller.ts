import { SearchKeys } from "./../../utils/Queries";
import { Request, Response } from "express";
import { conversation_service } from "./conversation_service";
import { sendResponse } from "../../utils/sendResponse";
import { HttpStatus } from "../../DefaultConfig/config";
import { IAuth } from "../Auth/auth_types";
import { IConversation } from "./conversation_types";

async function create(req: Request, res: Response) {
  const data = [req.body.user, req.user?._id];
  const result = await conversation_service.create({ users: data });
  sendResponse(res, HttpStatus.CREATED, result);
}

async function get_all(req: Request, res: Response) {
  const { search, ...otherValues } = req?.query;
  const searchKeys: SearchKeys = {};

  if (search) searchKeys.name = search as string;

  const queryKeys = {
    ...otherValues,
  };
  queryKeys.users = { $in: [req.user?._id as string] };

  const populatePath: string | string[] = "users";
  const selectFields: string | string[] = "name email img _id";
  const modelSelect: string = "";

  const result = await conversation_service.get_all(
    queryKeys,
    searchKeys,
    populatePath,
    selectFields,
    modelSelect,
  );
  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function update(req: Request, res: Response) {
  const img =
    (!Array.isArray(req.files) &&
      req.files?.img &&
      req.files.img.length > 0 &&
      req.files.img[0]?.path) ||
    null;

  if (img) req.body.img = img;

  const result = await conversation_service.update(req?.params?.id, req?.body);
  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function delete_conversation(req: Request, res: Response) {
  const result = await conversation_service.delete_conversation(
    req?.params?.id,
    req?.body,
    req?.user as IAuth,
  );
  sendResponse(res, HttpStatus.SUCCESS, result);
}

export const conversation_controller = {
  create,
  get_all,
  update,
  delete_conversation,
};
