import { SearchKeys } from "./../../utils/Queries";
import { Request, Response } from "express";
import { divisions_service } from "./divisions_service";
import { sendResponse } from "../../utils/sendResponse";
import { HttpStatus } from "../../DefaultConfig/config";
import { IAuth } from "../Auth/auth_types";

const create = async (req: Request, res: Response) => {
  const result = await divisions_service.create(req?.body);
  sendResponse(res, HttpStatus.CREATED, result);
};

const get_all = async (req: Request, res: Response) => {
  const { search, ...otherValues } = req?.query;
  const searchKeys: SearchKeys = {};

  if (search) searchKeys.name = search as string;

  const queryKeys = {
    ...otherValues,
  };

  const result = await divisions_service.get_all(queryKeys, searchKeys);
  sendResponse(res, HttpStatus.SUCCESS, result);
};

const update = async (req: Request, res: Response) => {
  const result = await divisions_service.update(req?.params?.id, req?.body);
  sendResponse(res, HttpStatus.SUCCESS, result);
};

const delete_divisions = async (req: Request, res: Response) => {
  const result = await divisions_service.delete_divisions(
    req?.params?.id,
    req?.body,
    req?.user as IAuth,
  );
  sendResponse(res, HttpStatus.SUCCESS, result);
};

export const divisions_controller = {
  create,
  get_all,
  update,
  delete_divisions,
};
