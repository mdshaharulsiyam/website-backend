import { Request, Response } from "express";
import { HttpStatus } from "../../DefaultConfig/config";
import { UnlinkFiles } from "../../middleware/fileUploader";
import { CustomError } from "../../utils/globalErrorHandler";
import { QueryKeys, SearchKeys } from "../../utils/Queries";
import { sendResponse } from "../../utils/sendResponse";
import { product_service } from "./product_service";

const getNumberFilter = (value: unknown, fieldName: string) => {
  let rawValue = Array.isArray(value) ? value[0] : value;

  if (typeof rawValue === "string") {
    rawValue = rawValue.trim();
  }

  if (rawValue === undefined || rawValue === null || rawValue === "" || rawValue === "undefined") {
    return undefined;
  }

  const numberValue = Number(rawValue);

  if (!Number.isFinite(numberValue)) {
    throw new CustomError(`${fieldName} must be a valid number`, HttpStatus.BAD_REQUEST);
  }

  return numberValue;
};

const create = async function (req: Request, res: Response) {
  const { deleted_images, retained_images, coupon_code, ...data } = req.body;

  if (coupon_code !== "undefined" && coupon_code) {
    data.coupon = {
      available: true,
      coupon_code: coupon_code,
    };
  }
  const img =
    (!Array.isArray(req.files) &&
      req.files?.img &&
      req.files.img.length > 0 &&
      req.files.img?.map((doc: any) => doc.path)) ||
    null;

  if (img && img?.length > 0) data.img = img;

  data.user = req?.user?._id;
  if (data?.size) {
    data.size = JSON.parse(req.body.size);
  }
  if (data?.color) {
    data.color = JSON.parse(req.body.color);
  }
  if (data?.tag) {
    data.tag = JSON.parse(req.body.tag);
  }
  const result = await product_service.create(data);

  sendResponse(res, HttpStatus.SUCCESS, result);
};

const get_all = async function (req: Request, res: Response) {
  const { search, popular, featured, sub_category, top_rated, rating_min, price_min, price_max, flag, ...other_fields } =
    req.query;

  const searchKeys: SearchKeys = {};

  const queryKeys: QueryKeys = { ...other_fields };

  if (typeof search === "string") searchKeys.name = search;

  if (sub_category && typeof sub_category === "string") {
    const sub_category_array = sub_category
      .split(",")
      .map((sub_category) => sub_category.trim())
      .filter(Boolean);

    if (sub_category_array.length > 0) {
      queryKeys.sub_category = { $in: sub_category_array };
    }
  }

  const minRating = getNumberFilter(rating_min, "rating_min");
  const minPrice = getNumberFilter(price_min, "price_min");
  const maxPrice = getNumberFilter(price_max, "price_max");

  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    throw new CustomError("price_min cannot be greater than price_max", HttpStatus.BAD_REQUEST);
  }

  if (minRating !== undefined) {
    queryKeys.averageRating = { $gte: minRating };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    queryKeys.price_after_discount = {
      ...(minPrice !== undefined ? { $gte: minPrice } : {}),
      ...(maxPrice !== undefined ? { $lte: maxPrice } : {}),
    };
  }

  if (top_rated) {
    queryKeys.sort = "averageRating";
    queryKeys.order = "desc";
  }

  if (flag) {
    queryKeys.flag = { $in: JSON.parse(flag as string) };
    // queryKeys.order = "desc";
  }

  const result = await product_service.get_all(
    queryKeys,
    searchKeys,
  );

  sendResponse(res, HttpStatus.SUCCESS, result);
};

const get_product_details = async function (req: Request, res: Response) {
  const result = await product_service.get_details(req?.params?.id);
  sendResponse(res, HttpStatus.SUCCESS, result);
};

const update = async function (req: Request, res: Response) {
  const { retained_images: prev, deleted_images: del, coupon_code, ...data } = req.body;
  if (coupon_code !== "undefined" && coupon_code) {
    data.coupon = {
      available: true,
      coupon_code: coupon_code,
    };
  }
  const retained_images = JSON.parse(prev);
  const deleted_images = JSON.parse(del);

  let updated_images: string[] = [];
  if (retained_images) {
    updated_images = [...retained_images];
  }
  const img =
    (!Array.isArray(req.files) &&
      req.files?.img &&
      req.files.img.length > 0 &&
      req.files.img?.map((doc: any) => doc.path)) ||
    null;

  if (img) updated_images = [...updated_images, ...img];

  if (deleted_images && deleted_images.length > 0) {
    UnlinkFiles(deleted_images);
  }

  data.img = updated_images;

  const result = await product_service.update_product(
    req?.params?.id,
    req?.user?._id as string,
    data,
  );

  sendResponse(res, HttpStatus.SUCCESS, result);
};

const delete_product = async function (req: Request, res: Response) {
  const result = await product_service.delete_product(
    req?.params?.id,
    req?.user?._id as string,
  );

  sendResponse(res, HttpStatus.SUCCESS, result);
};



export const product_controller = Object.freeze({
  create,
  get_all,
  get_product_details,
  update,
  delete_product,
});
