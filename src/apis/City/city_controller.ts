import { Request, Response } from "express";
import { city_service } from "./city_service";
import { sendResponse } from "../../utils/sendResponse";
import { HttpStatus } from "../../DefaultConfig/config";

async function create(req: Request, res: Response) {
  const result = await city_service.create(req.body);
  sendResponse(res, HttpStatus.CREATED, result);
}

async function get_all(req: Request, res: Response) {
  const result = await city_service.get_all();
  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function update(req: Request, res: Response) {
  const result = await city_service.update(req.params.id, req.body);
  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function delete_city(req: Request, res: Response) {
  const result = await city_service.delete_city(req.params.id);
  sendResponse(res, HttpStatus.SUCCESS, result);
}

export const city_controller = Object.freeze({
  create,
  get_all,
  update,
  delete_city,
});
