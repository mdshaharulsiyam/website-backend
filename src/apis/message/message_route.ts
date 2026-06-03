import express from "express";
import asyncWrapper from "../../middleware/asyncWrapper";
import { message_controller } from "./message_controller";
import verifyToken from "../../middleware/verifyToken";
import config from "../../DefaultConfig/config";
import uploadFile from "../../middleware/fileUploader";

export const message_router = express.Router();

message_router
  .post(
    "/message/create",
    verifyToken(config.USER),
    uploadFile(),
    asyncWrapper(message_controller.create),
  )

  .get(
    "/message/get-all",
    verifyToken(config.USER),
    asyncWrapper(message_controller.get_all),
  )

  .patch(
    "/message/update/:id",
    verifyToken(config.ADMIN),
    uploadFile(),
    asyncWrapper(message_controller.update),
  )

  .delete(
    "/message/delete/:id",
    verifyToken(config.ADMIN),
    asyncWrapper(message_controller.delete_message),
  );
