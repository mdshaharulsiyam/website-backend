import { Request, Response } from "express";
import { state_service } from "./state_service";
import { sendResponse } from "../../utils/sendResponse";
import { HttpStatus } from "../../DefaultConfig/config";

async function create(req: Request, res: Response) {
  const result = await state_service.create(req.body);
  sendResponse(res, HttpStatus.CREATED, result);
}

async function get_all(req: Request, res: Response) {
  const result = await state_service.get_all();
  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function update(req: Request, res: Response) {
  const result = await state_service.update(req.params.id, req.body);
  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function delete_state(req: Request, res: Response) {
  const result = await state_service.delete_state(req.params.id);
  sendResponse(res, HttpStatus.SUCCESS, result);
}

export const state_controller = Object.freeze({
  create,
  get_all,
  update,
  delete_state,
});
