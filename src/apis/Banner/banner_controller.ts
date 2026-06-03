import { Request, Response } from "express";
import { HttpStatus } from "../../DefaultConfig/config";
import { sendResponse } from "../../utils/sendResponse";
import { banner_service } from "./banner_service";

function normalize_banner_body(body: Record<string, any>) {
  if (Array.isArray(body.img)) body.img = body.img[0];
  if (typeof body.is_active === "string") body.is_active = body.is_active === "true";
  if (body.start_date) body.start_date = new Date(body.start_date);
  if (body.end_date) body.end_date = new Date(body.end_date);
  return body;
}

const create = async (req: Request, res: Response) => {
  const result = await banner_service.create(normalize_banner_body(req.body));

  sendResponse(res, HttpStatus.SUCCESS, result);
};

const update = async (req: Request, res: Response) => {
  const { id } = req.params;

  const img =
    (!Array.isArray(req.files) &&
      req.files?.img &&
      req.files.img.length > 0 &&
      req.files.img[0]?.path) ||
    null;

  if (img) req.body.img = img;

  const result = await banner_service.update(id, normalize_banner_body(req.body));

  sendResponse(res, HttpStatus.SUCCESS, result);
};

const delete_banner = async (req: Request, res: Response) => {
  const { id } = req.params;

  await banner_service.delete_banner(id);

  sendResponse(res, HttpStatus.SUCCESS, {
    success: true,
    message: "banner deleted successfully",
  });
};

const get_all = async (req: Request, res: Response) => {
  let searchKeys = {};

  const { search, ...otherFields } = req.query;
  const queryKeys = { ...otherFields };

  const result = await banner_service.get_all(queryKeys, searchKeys);

  sendResponse(res, HttpStatus.SUCCESS, result);
};

export const banner_controller = Object.freeze({
  create,
  update,
  delete_banner,
  get_all,
});
