import express from "express";
import asyncWrapper from "../../middleware/asyncWrapper";
import { state_controller } from "./state_controller";
import verifyToken from "../../middleware/verifyToken";
import config from "../../DefaultConfig/config";

export const state_router = express.Router();

state_router.post(
  "/state/create",
  verifyToken(config.ADMIN),
  asyncWrapper(state_controller.create),
);

state_router.get("/state/get-all", asyncWrapper(state_controller.get_all));

state_router.patch(
  "/state/update/:id",
  verifyToken(config.ADMIN),
  asyncWrapper(state_controller.update),
);

state_router.delete(
  "/state/delete/:id",
  verifyToken(config.ADMIN),
  asyncWrapper(state_controller.delete_state),
);
