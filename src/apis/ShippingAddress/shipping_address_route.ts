import express from "express";
import asyncWrapper from "../../middleware/asyncWrapper";
import verifyToken from "../../middleware/verifyToken";
import config from "../../DefaultConfig/config";
import { shipping_address_controller } from "./shipping_address_controller";

export const shipping_address_router = express.Router();

shipping_address_router
  .post(
    "/shipping-address/create",
    verifyToken(config.USER),
    asyncWrapper(shipping_address_controller.create),
  )

  .get(
    "/shipping-address/get-all",
    verifyToken(config.USER),
    asyncWrapper(shipping_address_controller.get_all),
  )

  .delete(
    "/shipping-address/delete/:id",
    verifyToken(config.USER),
    asyncWrapper(shipping_address_controller.delete_shipping_address),
  )

  .patch(
    "/shipping-address/update/:id",
    verifyToken(config.USER),
    asyncWrapper(shipping_address_controller.update),
  );
