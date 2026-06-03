import express from "express";
import config from "../../DefaultConfig/config";
import asyncWrapper from "../../middleware/asyncWrapper";
import uploadFile from "../../middleware/fileUploader";
import verifyToken from "../../middleware/verifyToken";
import { districts_controller } from "./districts_controller";

export const districts_router = express.Router();

districts_router
  .post(
    "/districts/create",
    verifyToken(config.ADMIN),
    uploadFile(),
    asyncWrapper(districts_controller.create),
  )

  .get("/districts/get-all", asyncWrapper(districts_controller.get_all))

  .patch(
    "/districts/update/:id",
    verifyToken(config.ADMIN),
    uploadFile(),
    asyncWrapper(districts_controller.update),
  )

  .delete(
    "/districts/delete/:id",
    verifyToken(config.ADMIN),
    asyncWrapper(districts_controller.delete_districts),
  );
