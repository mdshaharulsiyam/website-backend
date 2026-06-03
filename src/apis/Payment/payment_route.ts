import express from "express";
import asyncWrapper from "../../middleware/asyncWrapper";
import verifyToken from "../../middleware/verifyToken";
import config from "../../DefaultConfig/config";
import { payment_controller } from "./payment_controller";
export const payment_route = express.Router();
payment_route
  .post(
    "/payment/create",
    verifyToken(config.USER),
    asyncWrapper(payment_controller.create),
  )

  .get("/payment/cancel", asyncWrapper(payment_controller.cancel))

  .get("/payment/success", asyncWrapper(payment_controller.success))

  .post(
    "/payment/create-stripe-account",
    verifyToken(config.USER),
    asyncWrapper(payment_controller.create_account),
  )

  .get(
    "/payment/success-account/:id",
    asyncWrapper(payment_controller.success_account),
  )

  .post(
    "/payment/refresh-account-connect/:id",
    verifyToken(config.ADMIN),
    asyncWrapper(payment_controller.refresh_account_connect),
  )

  .post(
    "/payment/check-payment-status",
    asyncWrapper(payment_controller.check_payment_status),
  )

  .post(
    "/payment/transfer-balance",
    verifyToken(config.ADMIN),
    asyncWrapper(payment_controller.transfer_balance),
  )

  .post(
    "/payment/refund",
    verifyToken(config.ADMIN),
    asyncWrapper(payment_controller.refund),
  );
