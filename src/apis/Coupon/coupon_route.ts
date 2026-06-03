import express from "express";

import config from "../../DefaultConfig/config";
import asyncWrapper from "../../middleware/asyncWrapper";
import verifyToken from "../../middleware/verifyToken";
import { coupon_controller } from "./coupon_controller";

export const coupon_router = express.Router();

coupon_router
  .post(
    "/coupon/create",
    verifyToken(config.ADMIN),
    asyncWrapper(coupon_controller.create),
  )
  .patch(
    "/coupon/update/:id",
    verifyToken(config.ADMIN),
    asyncWrapper(coupon_controller.update),
  )
  .get("/coupon/get-all", asyncWrapper(coupon_controller.get_all))
  .delete(
    "/coupon/delete/:id",
    verifyToken(config.ADMIN),
    asyncWrapper(coupon_controller.delete_coupon),
  )

  .post(
    "/coupon/check-coupon/:name",
    asyncWrapper(coupon_controller.check_coupon),
  );
