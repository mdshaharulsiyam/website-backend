import { Request, Response } from "express";
import { HttpStatus } from "../../DefaultConfig/config";
import { sendResponse } from "../../utils/sendResponse";
import { IAuth } from "../Auth/auth_types";
import { QueryKeys, SearchKeys } from "./../../utils/Queries";
import { category_service } from "./category_service";

async function create(req: Request, res: Response) {

  if (req.body.img) req.body.img = req.body.img[0];

  const result = await category_service.create(req.body);
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
  const result = await category_service.get_all(queryKeys, searchKeys);
  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function update(req: Request, res: Response) {


  if (req.body.img) req.body.img = req.body.img[0];

  const result = await category_service.update(req?.params?.id, req?.body);
  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function delete_category(req: Request, res: Response) {
  const result = await category_service.delete_category(
    req?.params?.id,
    req?.body,
    req?.user as IAuth,
  );
  sendResponse(res, HttpStatus.SUCCESS, result);
}

export const category_controller = {
  create,
  get_all,
  update,
  delete_category,
};
