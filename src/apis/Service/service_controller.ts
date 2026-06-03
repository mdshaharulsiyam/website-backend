import { Request, Response } from "express";
import { HttpStatus } from "../../DefaultConfig/config";
import { sendResponse } from "../../utils/sendResponse";
import { QueryKeys, SearchKeys } from "./../../utils/Queries";
import { service_service } from "./service_service";

async function create(req: Request, res: Response) {

  if (Array.isArray(req.body.img)) req.body.img = req.body.img[0];

  const result = await service_service.create(req?.body);
  sendResponse(res, HttpStatus.CREATED, result);
}

async function get_all(req: Request, res: Response) {
  const { search, is_active, ...otherValues } = req?.query;
  const searchKeys: SearchKeys = {};

  if (search) searchKeys.name = search as string;

  const queryKeys = {
    ...otherValues,
  } as QueryKeys;
  if (is_active) {
    queryKeys.is_active = is_active == "true" ? true : false;
  } else {
    queryKeys.is_active = true;
  }
  const populatePath: string | string[] = "";
  const selectFields: string | string[] = "";
  const modelSelect: string = "name img _id";

  const result = await service_service.get_all(
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
  if (Array.isArray(req.body.img)) req.body.img = req.body.img[0];

  const result = await service_service.update(req?.params?.id, req?.body);
  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function delete_service(req: Request, res: Response) {
  const result = await service_service.delete_service(req?.params?.id); // req?.body, req?.user as IAuth
  sendResponse(res, HttpStatus.SUCCESS, result);
}

export const category_controller = {
  create,
  get_all,
  update,
  delete_service,
};
