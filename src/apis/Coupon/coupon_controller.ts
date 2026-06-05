import { Request, Response } from "express";
import { HttpStatus } from "../../DefaultConfig/config";
import { QueryKeys, SearchKeys } from "../../utils/Queries";
import { sendResponse } from "../../utils/sendResponse";
import { coupon_service } from "./coupon_service";

const create = async (req: Request, res: Response) => {
  const result = await coupon_service.create(req?.body);

  sendResponse(res, HttpStatus.SUCCESS, result);
};

const update = async (req: Request, res: Response) => {
  const result = await coupon_service.update(req?.params?.id, req?.body);

  sendResponse(res, HttpStatus.SUCCESS, result);
};

const delete_coupon = async (req: Request, res: Response) => {
  const result = await coupon_service.delete_coupon(req?.params?.id);

  sendResponse(res, HttpStatus.SUCCESS, result);
};

const check_coupon = async (req: Request, res: Response) => {
  const result = await coupon_service.check_coupon(
    req?.params?.name,
    req.body?.items,
    req.body?.total_amount
  );

  sendResponse(res, HttpStatus.SUCCESS, result);
};

const get_all = async (req: Request, res: Response) => {
  let searchKeys = {} as SearchKeys;

  const { search, ...otherFields } = req.query;

  const queryKeys = { ...otherFields } as QueryKeys;

  if (search) searchKeys.name = search as string;

  const result = await coupon_service.get_all(queryKeys, searchKeys);

  sendResponse(res, HttpStatus.SUCCESS, result);
};

export const coupon_controller = Object.freeze({
  create,
  update,
  delete_coupon,
  check_coupon,
  get_all,
});
