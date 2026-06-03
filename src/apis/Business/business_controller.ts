import { Request, Response } from "express";
import { business_service } from "./business_service";
import { sendResponse } from "../../utils/sendResponse";
import { HttpStatus } from "../../DefaultConfig/config";
import { SearchKeys } from "../../utils/Queries";
import { setting_service } from "../Setting/setting_service";

const create = async (req: Request, res: Response) => {
  const web_setting = await setting_service.get_web_setting();

  const business_documents =
    (!Array.isArray(req.files) &&
      req.files?.business_documents &&
      req.files.business_documents.length > 0 &&
      req.files.business_documents.map((doc: any) => doc.path)) ||
    [];
  const logo =
    (!Array.isArray(req.files) &&
      req.files?.logo &&
      req.files.logo.length > 0 &&
      req.files.logo[0]?.path) ||
    null;

  const banner =
    (!Array.isArray(req.files) &&
      req.files?.banner &&
      req.files.banner.length > 0 &&
      req.files.banner[0]?.path) ||
    null;

  if (req.body.coordinates)
    req.body.location.coordinates = JSON.parse(req.body.coordinates);
  if (req?.user?.role != "ADMIN" && req.user?.role != "SUPER_ADMIN")
    req.body.user = req?.user?._id;

  req.body.logo = logo;
  req.body.banner = banner;
  req.body.business_documents = business_documents;
  req.body.is_approve = web_setting?.data?.auto_approve_vendor;

  const result = await business_service.create(req?.body);

  sendResponse(res, HttpStatus.SUCCESS, result);
};

const get_all = async (req: Request, res: Response) => {
  const { search, ...other_fields } = req.query;
  let searchKeys = {} as SearchKeys;

  let queryKeys = { ...other_fields };

  if (search) searchKeys.name = search as string;

  const populatePath = "user";

  const selectFields = "";
  const result = await business_service.get_all(
    queryKeys,
    searchKeys,
    populatePath,
    selectFields,
  );

  sendResponse(res, HttpStatus.SUCCESS, result);
};

const update = async (req: Request, res: Response) => {
  const web_setting = await setting_service.get_web_setting();

  const logo =
    (!Array.isArray(req.files) &&
      req.files?.logo &&
      req.files.logo.length > 0 &&
      req.files.logo[0]?.path) ||
    null;

  const business_documents =
    (!Array.isArray(req.files) &&
      req.files?.business_documents &&
      req.files.business_documents.length > 0 &&
      req.files.business_documents.map((doc: any) => doc.path)) ||
    [];
  const banner =
    (!Array.isArray(req.files) &&
      req.files?.banner &&
      req.files.banner.length > 0 &&
      req.files.banner[0]?.path) ||
    null;

  if (logo) req.body.logo = logo;
  if (business_documents) req.body.business_documents = business_documents;
  if (banner) req.body.banner = banner;
  if (req.body.coordinates)
    req.body.location.coordinates = JSON.parse(req.body.coordinates);
  if (req?.user?.role != "ADMIN" && req.user?.role != "SUPER_ADMIN")
    req.body.user = req?.user?._id;

  req.body.is_approve = web_setting?.data?.auto_approve_vendor;

  const result = await business_service.update(req?.params?.id, req?.body);

  sendResponse(res, HttpStatus.SUCCESS, result);
};

const delete_business = async (req: Request, res: Response) => {
  const result = await business_service.delete_business(
    req?.params?.id,
    req?.user?._id as string,
  );

  sendResponse(res, HttpStatus.SUCCESS, result);
};

const approve_shop = async (req: Request, res: Response) => {
  const result = await business_service.approve_shop(
    req?.params?.id,
    req?.user?._id as string,
  );

  sendResponse(res, HttpStatus.SUCCESS, result);
};

const block_shop = async (req: Request, res: Response) => {
  const result = await business_service.block_shop(
    req?.params?.id,
    req?.user?._id as string,
  );

  sendResponse(res, HttpStatus.SUCCESS, result);
};

export const business_controller = Object.freeze({
  create,
  get_all,
  update,
  delete_business,
  approve_shop,
  block_shop,
});
