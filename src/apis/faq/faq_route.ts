import express from "express";
import asyncWrapper from "../../middleware/asyncWrapper";
import { faq_controller } from "./faq_controller";
import verifyToken from "../../middleware/verifyToken";
import config from "../../DefaultConfig/config";

export const faq_router = express.Router();

faq_router.post(
  "/faq/create",
  verifyToken(config.ADMIN),
  asyncWrapper(faq_controller.create),
);
faq_router.get("/faq/get-all", asyncWrapper(faq_controller.get_all));
faq_router.patch(
  "/faq/update/:id",
  verifyToken(config.ADMIN),
  asyncWrapper(faq_controller.update),
);
faq_router.delete(
  "/faq/delete/:id",
  verifyToken(config.ADMIN),
  asyncWrapper(faq_controller.delete_faq),
);
