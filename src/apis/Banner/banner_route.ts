import express from "express";
import verifyToken from "../../middleware/verifyToken";
import config from "../../DefaultConfig/config";
import uploadFile from "../../middleware/fileUploader";
import asyncWrapper from "../../middleware/asyncWrapper";
import { banner_controller } from "./banner_controller";
import validateRequest from "../../middleware/validateRequest";
import { banner_validate } from "./banner_validate";

export const banner_router = express.Router();

banner_router
  .post(
    "/banner/create",
    uploadFile(),
    validateRequest(banner_validate.create_validate),
    verifyToken(config.ADMIN),
    asyncWrapper(banner_controller.create),
  )

  .get("/banner/get-all", asyncWrapper(banner_controller.get_all))

  .patch(
    "/banner/update/:id",
    uploadFile(),
    validateRequest(banner_validate.update_validate),
    verifyToken(config.ADMIN),
    asyncWrapper(banner_controller.update),
  )

  .delete(
    "/banner/delete/:id",
    verifyToken(config.ADMIN),
    asyncWrapper(banner_controller.delete_banner),
  );
