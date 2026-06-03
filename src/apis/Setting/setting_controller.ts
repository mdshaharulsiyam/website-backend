import { Request, Response } from "express";
import { HttpStatus } from "../../DefaultConfig/config";
import { sendResponse } from "../../utils/sendResponse";
import { setting_service } from "./setting_service";

async function create(req: Request, res: Response) {
  const result = await setting_service.create(req.body);

  sendResponse(res, HttpStatus.SUCCESS, result);
}

const create_web_setting = async (req: Request, res: Response) => {
  const files = req.files as
    | { [key: string]: Express.Multer.File[] }
    | undefined;

  const logo =
    files?.logo && files.logo.length > 0 && files.logo[0]?.path
      ? files.logo[0].path
      : files?.img && files.img.length > 0 && files.img[0]?.path
      ? files.img[0].path
      : undefined;

  const favicon =
    files?.favicon && files.favicon.length > 0 && files.favicon[0]?.path
      ? files.favicon[0].path
      : undefined;

  const payload = { ...req.body };
  if (logo !== undefined) {
    payload.logo = logo;
  }
  if (favicon !== undefined) {
    payload.favicon = favicon;
  }

  const result = await setting_service.create_web_setting(payload);
  sendResponse(res, HttpStatus.SUCCESS, result);
};

async function get(req: Request, res: Response) {
  const result = await setting_service.get(req?.params?.name);

  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function get_web_setting(req: Request, res: Response) {
  const result = await setting_service.get_web_setting();

  sendResponse(res, HttpStatus.SUCCESS, result);
}

export const setting_controller = Object.freeze({
  create,
  get,
  create_web_setting,
  get_web_setting,
});
