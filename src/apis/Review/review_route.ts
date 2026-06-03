import express from "express";
import config from "../../DefaultConfig/config";
import asyncWrapper from "../../middleware/asyncWrapper";
import uploadFile from "../../middleware/fileUploader";
import verifyToken from "../../middleware/verifyToken";
import { review_controller } from "./review_controller";

export const review_router = express.Router();

review_router
  .post(
    "/review/create",
    verifyToken(config.USER),
    uploadFile(),
    asyncWrapper(review_controller.create),
  )

  .get("/review/get-all", asyncWrapper(review_controller.get_all))

  .delete(
    "/review/delete/:id",
    verifyToken(config.ADMIN),
    asyncWrapper(review_controller.delete_review),
  )
