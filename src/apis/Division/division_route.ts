import express from "express";
import asyncWrapper from "../../middleware/asyncWrapper";
import { division_controller } from "./division_controller";
import verifyToken from "../../middleware/verifyToken";
import config from "../../DefaultConfig/config";

export const division_router = express.Router();

division_router.post(
  "/division/create",
  verifyToken(config.ADMIN),
  asyncWrapper(division_controller.create),
);

division_router.get("/division/get-all", asyncWrapper(division_controller.get_all));

division_router.patch(
  "/division/update/:id",
  verifyToken(config.ADMIN),
  asyncWrapper(division_controller.update),
);

division_router.delete(
  "/division/delete/:id",
  verifyToken(config.ADMIN),
  asyncWrapper(division_controller.delete_division),
);
