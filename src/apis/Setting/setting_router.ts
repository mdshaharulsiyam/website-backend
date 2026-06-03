import express from "express";
import config from "../../DefaultConfig/config";
import asyncWrapper from "../../middleware/asyncWrapper";
import uploadFile from '../../middleware/fileUploader';
import verifyToken from "../../middleware/verifyToken";
import { setting_controller } from "./setting_controller";

export const setting_router = express.Router();

setting_router
  .get("/setting/:name", asyncWrapper(setting_controller.get))

  .patch(
    "/setting/create",
    verifyToken(config.ADMIN),
    asyncWrapper(setting_controller.create),
  )
  .patch(
    "/web-setting/create",
    verifyToken(config.ADMIN),
    uploadFile(),
    asyncWrapper(setting_controller.create_web_setting),
  )
  .get("/web-setting/get", asyncWrapper(setting_controller.get_web_setting));
