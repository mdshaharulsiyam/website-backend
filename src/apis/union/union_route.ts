import express from "express";
import asyncWrapper from "../../middleware/asyncWrapper";
import { union_controller } from "./union_controller";
import verifyToken from "../../middleware/verifyToken";
import config from "../../DefaultConfig/config";
import uploadFile from "../../middleware/fileUploader";

export const union_router = express.Router();

union_router
  .post(
    "/union/create",
    verifyToken(config.ADMIN),
    uploadFile(),
    asyncWrapper(union_controller.create),
  )

  .get("/union/get-all", asyncWrapper(union_controller.get_all))

  .patch(
    "/union/update/:id",
    verifyToken(config.ADMIN),
    uploadFile(),
    asyncWrapper(union_controller.update),
  )

  .delete(
    "/union/delete/:id",
    verifyToken(config.ADMIN),
    asyncWrapper(union_controller.delete_union),
  );
