import express from "express";
import asyncWrapper from "../../middleware/asyncWrapper";
import { city_controller } from "./city_controller";
import verifyToken from "../../middleware/verifyToken";
import config from "../../DefaultConfig/config";

export const city_router = express.Router();

city_router.post(
  "/city/create",
  verifyToken(config.ADMIN),
  asyncWrapper(city_controller.create),
);

city_router.get("/city/get-all", asyncWrapper(city_controller.get_all));

city_router.patch(
  "/city/update/:id",
  verifyToken(config.ADMIN),
  asyncWrapper(city_controller.update),
);

city_router.delete(
  "/city/delete/:id",
  verifyToken(config.ADMIN),
  asyncWrapper(city_controller.delete_city),
);
