import { Request, Response } from "express";
import { HttpStatus } from "../../DefaultConfig/config";
import { sendResponse } from "../../utils/sendResponse";
import { affiliate_service } from "./affiliate_service";
import { IAuth } from "../Auth/auth_types";

async function generate_link(req: Request, res: Response) {
  const result = await affiliate_service.generate_link(req.params.product_id, req.user as IAuth);
  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function track_click(req: Request, res: Response) {
  const result = await affiliate_service.track_click(req.params.affiliate_id, req.params.product_id);
  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function checkout_affiliate(req: Request, res: Response) {
  const result = await affiliate_service.checkout_affiliate(req.body, req.user as IAuth);
  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function create_withdrawal(req: Request, res: Response) {
  const result = await affiliate_service.create_withdrawal(req.body, req.user as IAuth);
  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function get_affiliate_orders(req: Request, res: Response) {
  const result = await affiliate_service.get_affiliate_orders(req.user as IAuth, req.query);
  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function get_withdrawals(req: Request, res: Response) {
  const result = await affiliate_service.get_withdrawals(req.user as IAuth, req.query);
  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function admin_get_referral_orders(req: Request, res: Response) {
  const result = await affiliate_service.admin_get_referral_orders(req.query);
  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function admin_update_referral_order(req: Request, res: Response) {
  const result = await affiliate_service.admin_update_referral_order(req.params.id, req.body.status);
  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function admin_get_withdrawals(req: Request, res: Response) {
  const result = await affiliate_service.admin_get_withdrawals(req.query);
  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function admin_update_withdrawal(req: Request, res: Response) {
  const result = await affiliate_service.admin_update_withdrawal(req.params.id, req.body.status);
  sendResponse(res, HttpStatus.SUCCESS, result);
}

export const affiliate_controller = Object.freeze({
  generate_link,
  track_click,
  checkout_affiliate,
  get_affiliate_orders,
  create_withdrawal,
  get_withdrawals,
  admin_get_referral_orders,
  admin_update_referral_order,
  admin_get_withdrawals,
  admin_update_withdrawal,
});
