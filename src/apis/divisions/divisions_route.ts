import express from "express";
import config from "../../DefaultConfig/config";
import asyncWrapper from "../../middleware/asyncWrapper";
import uploadFile from "../../middleware/fileUploader";
import verifyToken from "../../middleware/verifyToken";
import { divisions_controller } from "./divisions_controller";

export const divisions_router = express.Router();

divisions_router
  .post(
    "/divisions/create",
    verifyToken(config.ADMIN),
    uploadFile(),
    asyncWrapper(divisions_controller.create),
  )

  .get("/divisions/get-all", asyncWrapper(divisions_controller.get_all))

  .patch(
    "/divisions/update/:id",
    verifyToken(config.ADMIN),
    uploadFile(),
    asyncWrapper(divisions_controller.update),
  )

  .delete(
    "/divisions/delete/:id",
    verifyToken(config.ADMIN),
    asyncWrapper(divisions_controller.delete_divisions),
  );
