import express from "express";
import config from "../../DefaultConfig/config";
import asyncWrapper from "../../middleware/asyncWrapper";
import uploadFile from "../../middleware/fileUploader";
import validateRequest from "../../middleware/validateRequest";
import verifyToken from "../../middleware/verifyToken";
import { category_controller } from "./service_controller";
import { service_validate } from "./service_validate";

export const service_router = express.Router();

service_router
  .post(
    "/service/create",
    uploadFile(),
    validateRequest(service_validate.create_validate),
    verifyToken(config.ADMIN),
    validateRequest(service_validate.create_validate),
    asyncWrapper(category_controller.create),
  )

  .get("/service/get-all", asyncWrapper(category_controller.get_all))

  .patch(
    "/service/update/:id",
    uploadFile(),
    validateRequest(service_validate.update_validate),
    verifyToken(config.ADMIN),
    asyncWrapper(category_controller.update),
  )

  .delete(
    "/service/delete/:id",
    verifyToken(config.ADMIN),
    asyncWrapper(category_controller.delete_service),
  );
