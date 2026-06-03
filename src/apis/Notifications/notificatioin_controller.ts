import { Request, Response } from "express";
import { SearchKeys } from "../../utils/Queries";
import { HttpStatus } from "../../DefaultConfig/config";
import { sendResponse } from "../../utils/sendResponse";
import { notification_service } from "./notification_service";
import { IAuth } from "../Auth/auth_types";

async function get_all(req: Request, res: Response) {
  const { search, ...otherValues } = req?.query;
  const searchKeys: SearchKeys = {};

  if (search) {
    searchKeys.title = search as string;
    searchKeys.message = search as string;
  }

  const queryKeys = {
    ...otherValues,
  };

  if (req?.user?.role != "ADMIN" && req?.user?.role != "SUPER_ADMIN") {
    queryKeys.user = req?.user?._id as string;
  }

  const populatePath: string | string[] = "user";
  const selectFields: string | string[] = "name img _id";
  const modelSelect: string = "";

  const result = await notification_service.get_all(
    queryKeys,
    searchKeys,
    populatePath,
    selectFields,
    modelSelect,
  );
  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function create_campaign(req: Request, res: Response) {
  const result = await notification_service.create_campaign(
    req.body,
    req?.user as IAuth,
  );

  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function send_user_notification(req: Request, res: Response) {
  const result = await notification_service.send_user_notification(
    req.params.id,
    req.body,
  );

  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function get_campaigns(req: Request, res: Response) {
  const { search, ...query } = req.query;
  const result = await notification_service.get_campaigns(
    query,
    search as string | undefined,
  );

  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function get_templates(req: Request, res: Response) {
  const result = await notification_service.get_templates(
    req.query.type as "email" | "sms" | undefined,
  );

  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function update_template(req: Request, res: Response) {
  const result = await notification_service.update_template(
    req.params.id,
    req.body,
  );

  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function toggle_template(req: Request, res: Response) {
  const result = await notification_service.toggle_template(req.params.id);

  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function get_unread_count(req: Request, res: Response) {
  const result = await notification_service.get_unread_count(req.user as IAuth);

  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function read(req: Request, res: Response) {
  const result = await notification_service.read_notification(
    req?.params?.id,
    req?.user as IAuth,
  );

  sendResponse(res, HttpStatus.SUCCESS, result);
}

async function read_all(req: Request, res: Response) {
  const result = await notification_service.read_all_notifications(
    req.user as IAuth,
  );

  sendResponse(res, HttpStatus.SUCCESS, result);
}

export const notification_controller = Object.freeze({
  get_all,
  create_campaign,
  send_user_notification,
  get_campaigns,
  get_templates,
  update_template,
  toggle_template,
  get_unread_count,
  read,
  read_all,
});
