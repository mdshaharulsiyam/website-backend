import { Request, Response } from "express";
import { verification_service } from "./verification_service";
import { sendResponse } from "../../utils/sendResponse";
import config, { HttpStatus } from "../../DefaultConfig/config";

async function create(req: Request, res: Response) {
  const result = await verification_service.create(req?.body?.email);
  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function verify(req: Request, res: Response) {
  const result: any = await verification_service.verify(req.body);

  sendResponse(res, HttpStatus.SUCCESS, result, [
    config?.ACCESS_TOKEN_NAME,
    result?.data?.resetToken,
    60 * 3 * 1000,
  ]);
}

export const verification_controller = Object.freeze({
  create,
  verify,
});
