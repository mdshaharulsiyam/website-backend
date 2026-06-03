import { Request, Response } from "express";
import { HttpStatus } from "../../DefaultConfig/config";
import { sendResponse } from "../../utils/sendResponse";
import { IAuth } from "../Auth/auth_types";
import { order_service } from "./order_service";

const create_order = async (req: Request, res: Response) => {
  const result = await order_service.create_order(
    req.body,
    req?.user?._id as string,
  );

  sendResponse(res, HttpStatus.SUCCESS, result);
};

const get_all = async (req: Request, res: Response) => {
  const { search, ...other_fields } = req.query;
  let queryKeys = { ...other_fields };

  let populatePath = ["items.product", "user", "delivery_address"];
  let selectFields = ["name img price", "name img email phone", "-location -user -createdAt -updatedAt -__v"];

  const { role, _id } = req?.user as IAuth;
  if (role !== "VENDOR" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    queryKeys.user = _id as string;
    // populatePath = ["items.product"];
    // selectFields = ["name img price"];
  }

  let searchKeys = {} as { name: string };
  if (search) searchKeys.name = search as string;

  const result = await order_service.get_all(
    queryKeys,
    searchKeys,
    populatePath,
    selectFields,
    "-createdAt -updatedAt -__v"
  );
  sendResponse(res, HttpStatus.SUCCESS, result);
};

const get_order_details = async (req: Request, res: Response) => {
  const result = await order_service.get_order_details(req?.params?.id);

  sendResponse(res, HttpStatus.SUCCESS, result);
};

const update_order = async (req: Request, res: Response) => {
  const result = await order_service.update_order(req?.params?.id, req?.body);

  sendResponse(res, HttpStatus.SUCCESS, result);
};

const delete_order = async (req: Request, res: Response) => {
  const result = await order_service.delete_order(req?.params?.id);

  sendResponse(res, HttpStatus.SUCCESS, result);
};

const update_delivery_status = async (req: Request, res: Response) => {
  const result = await order_service.update_delivery_status(
    req?.params?.id,
    req?.body?.delivery_status,
  );

  sendResponse(res, HttpStatus.SUCCESS, result);
};

export const order_controller = Object.freeze({
  create_order,
  get_all,
  get_order_details,
  update_order,
  delete_order,
  update_delivery_status,
});
