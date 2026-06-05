import { Request, Response } from "express";
import { division_service } from "./division_service";
import { sendResponse } from "../../utils/sendResponse";
import { HttpStatus } from "../../DefaultConfig/config";

async function create(req: Request, res: Response) {
  const result = await division_service.create(req.body);
  sendResponse(res, HttpStatus.CREATED, result);
}

async function get_all(req: Request, res: Response) {
  const result = await division_service.get_all();
  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function update(req: Request, res: Response) {
  const result = await division_service.update(req.params.id, req.body);
  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function delete_division(req: Request, res: Response) {
  const result = await division_service.delete_division(req.params.id);
  sendResponse(res, HttpStatus.SUCCESS, result);
}

export const division_controller = Object.freeze({
  create,
  get_all,
  update,
  delete_division,
});
