import { Request, Response } from "express";
import { overview_service } from "./overview_service";
import { sendResponse } from "../../utils/sendResponse";
import { HttpStatus } from "../../DefaultConfig/config";

async function get_overview(req: Request, res: Response) {
  const result = await overview_service.get_overview(
    req?.query?.year_user as string,
    req?.query?.year_payment as string,
  );

  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function get_public_stats(req: Request, res: Response) {
  const result = await overview_service.get_public_stats();
  sendResponse(res, HttpStatus.SUCCESS, result);
}

export const overview_controller = Object.freeze({
  get_overview,
  get_public_stats,
});
