import express from "express";
import asyncWrapper from "../../middleware/asyncWrapper";
import { order_controller } from "./order_controller";
import verifyToken from "../../middleware/verifyToken";
import config from "../../DefaultConfig/config";

export const order_router = express.Router();

order_router
  .post(
    "/order/create",
    verifyToken(config.USER),
    asyncWrapper(order_controller.create_order),
  )

  .get(
    "/order/get-all",
    verifyToken(config.USER),
    asyncWrapper(order_controller.get_all),
  )

  .get(
    "/order/details/:id",
    verifyToken(config.USER),
    asyncWrapper(order_controller.get_order_details),
  )

  .patch(
    "/order/update/:id",
    verifyToken(config.USER),
    asyncWrapper(order_controller.update_order),
  )

  .delete(
    "/order/delete/:id",
    verifyToken(config.ADMIN),
    asyncWrapper(order_controller.delete_order),
  )

  .patch(
    "/order/update-delivery-status/:id",
    verifyToken(config.USER),
    asyncWrapper(order_controller.update_delivery_status),
  );
