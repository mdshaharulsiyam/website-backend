import express from "express";
import asyncWrapper from "../../middleware/asyncWrapper";
import { conversation_controller } from "./conversation_controller";
import verifyToken from "../../middleware/verifyToken";
import config from "../../DefaultConfig/config";
import uploadFile from "../../middleware/fileUploader";

export const conversation_router = express.Router();

conversation_router
  .post(
    "/conversation/create",
    verifyToken(config.USER),
    asyncWrapper(conversation_controller.create),
  )

  .get(
    "/conversation/get-all",
    verifyToken(config.USER),
    asyncWrapper(conversation_controller.get_all),
  )

  .patch(
    "/conversation/update/:id",
    verifyToken(config.ADMIN),
    uploadFile(),
    asyncWrapper(conversation_controller.update),
  )

  .delete(
    "/conversation/delete/:id",
    verifyToken(config.ADMIN),
    asyncWrapper(conversation_controller.delete_conversation),
  );
