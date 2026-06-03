import express from "express";
import config from "../../DefaultConfig/config";
import asyncWrapper from "../../middleware/asyncWrapper";
import verifyToken from "../../middleware/verifyToken";
import { overview_controller } from "./overview_controller";

export const overview_router = express.Router();

overview_router.get(
  "/dashboard/get-overview",
  verifyToken(config.ADMIN),
  asyncWrapper(overview_controller.get_overview),
);

overview_router.get(
  "/dashboard/get-stats",
  asyncWrapper(overview_controller.get_public_stats),
);
