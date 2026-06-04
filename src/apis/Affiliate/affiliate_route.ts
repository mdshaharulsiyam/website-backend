import express from "express";
import asyncWrapper from "../../middleware/asyncWrapper";
import verifyToken from "../../middleware/verifyToken";
import config from "../../DefaultConfig/config";
import { affiliate_controller } from "./affiliate_controller";

export const affiliate_router = express.Router();
export const affiliate_admin_router = express.Router();

// Public / User routes
affiliate_router
  .get(
    "/affiliate/generate-link/:product_id",
    verifyToken(config.USER),
    asyncWrapper(affiliate_controller.generate_link)
  )
  .post(
    "/affiliate/track-click/:affiliate_id/:product_id",
    asyncWrapper(affiliate_controller.track_click)
  )
  .post(
    "/affiliate/checkout",
    verifyToken(config.USER),
    asyncWrapper(affiliate_controller.checkout_affiliate)
  )
  .post(
    "/affiliate/withdraw",
    verifyToken(config.USER),
    asyncWrapper(affiliate_controller.create_withdrawal)
  )
  .get(
    "/affiliate/withdrawals",
    verifyToken(config.USER),
    asyncWrapper(affiliate_controller.get_withdrawals)
  );

// Admin routes
affiliate_admin_router
  .get(
    "/affiliate/admin/referral-orders",
    verifyToken(config.ADMIN),
    asyncWrapper(affiliate_controller.admin_get_referral_orders)
  )
  .patch(
    "/affiliate/admin/referral-orders/:id/status",
    verifyToken(config.ADMIN),
    asyncWrapper(affiliate_controller.admin_update_referral_order)
  )
  .get(
    "/affiliate/admin/withdrawals",
    verifyToken(config.ADMIN),
    asyncWrapper(affiliate_controller.admin_get_withdrawals)
  )
  .patch(
    "/affiliate/admin/withdrawals/:id/status",
    verifyToken(config.ADMIN),
    asyncWrapper(affiliate_controller.admin_update_withdrawal)
  );
