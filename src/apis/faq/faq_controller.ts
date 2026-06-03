import { Request, Response } from "express";
import { faq_service } from "./faq_service";
import { sendResponse } from "../../utils/sendResponse";
import { HttpStatus } from "../../DefaultConfig/config";

async function create(req: Request, res: Response) {
  const result = await faq_service.create(req.body);
  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function get_all(req: Request, res: Response) {
  const result = await faq_service.get_all();
  sendResponse(res, HttpStatus.SUCCESS, result);
}
async function update(req: Request, res: Response) {
  const result = await faq_service.update(req.params.id, req.body);
  sendResponse(res, HttpStatus.SUCCESS, result);
}
async function delete_faq(req: Request, res: Response) {
  const result = await faq_service.delete_faq(req.params.id);
  sendResponse(res, HttpStatus.SUCCESS, result);
}
export const faq_controller = Object.freeze({
  create,
  get_all,
  update,
  delete_faq,
});
