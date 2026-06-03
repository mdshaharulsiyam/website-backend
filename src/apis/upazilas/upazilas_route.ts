import express from "express";
import asyncWrapper from "../../middleware/asyncWrapper";
import { upazilas_controller } from "./upazilas_controller";
import verifyToken from "../../middleware/verifyToken";
import config from "../../DefaultConfig/config";
import uploadFile from "../../middleware/fileUploader";

export const upazilas_router = express.Router();

upazilas_router
  .post(
    "/upazilas/create",
    verifyToken(config.ADMIN),
    uploadFile(),
    asyncWrapper(upazilas_controller.create),
  )

  .get("/upazilas/get-all", asyncWrapper(upazilas_controller.get_all))

  .patch(
    "/upazilas/update/:id",
    verifyToken(config.ADMIN),
    uploadFile(),
    asyncWrapper(upazilas_controller.update),
  )

  .delete(
    "/upazilas/delete/:id",
    verifyToken(config.ADMIN),
    asyncWrapper(upazilas_controller.delete_upazilas),
  );
