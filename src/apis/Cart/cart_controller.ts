import { Request, Response } from "express";
import { HttpStatus } from "../../DefaultConfig/config";
import { SearchKeys } from "../../utils/Queries";
import { sendResponse } from "../../utils/sendResponse";
import { cart_service } from "./cart_service";

const create = async (req: Request, res: Response) => {
  const result = await cart_service.create(
    req?.user?._id as string,
    req?.body,
  );
  sendResponse(res, HttpStatus.SUCCESS, result);
};

const get_all = async (req: Request, res: Response) => {
  const { search, order, ...other_fields } = req.query;
  let searchKeys = {} as SearchKeys;
  let queryKeys = { ...other_fields };

  if (search) searchKeys.name = search as string;
  queryKeys.user = req.user?._id as string;

  const result = await cart_service.get_all(
    queryKeys,
    searchKeys,
  );

  sendResponse(res, HttpStatus.SUCCESS, result);
};

const delete_cart = async (req: Request, res: Response) => {
  const result = await cart_service.delete_cart(req?.params?.id as string);

  sendResponse(res, HttpStatus.SUCCESS, result);
};

const update = async (req: Request, res: Response) => {
  const result = await cart_service.update(
    req.user?._id as string,
    req.params.id as string,
    req.body?.quantity,
  );

  sendResponse(res, HttpStatus.SUCCESS, result);
};


export const cart_controller = Object.freeze({
  create,
  get_all,
  update,
  delete_cart,
});
