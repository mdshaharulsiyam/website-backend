import express from "express";
import asyncWrapper from "../../middleware/asyncWrapper";
import verifyToken from "../../middleware/verifyToken";
import config from "../../DefaultConfig/config";
import { notification_controller } from "./notificatioin_controller";

export const notification_router = express.Router();

notification_router
  .post(
    "/notification/campaigns",
    verifyToken(config.ADMIN),
    asyncWrapper(notification_controller.create_campaign),
  )

  .get(
    "/notification/campaigns",
    verifyToken(config.ADMIN),
    asyncWrapper(notification_controller.get_campaigns),
  )

  .post(
    "/notification/users/:id",
    verifyToken(config.ADMIN),
    asyncWrapper(notification_controller.send_user_notification),
  )

  .get(
    "/notification/templates",
    verifyToken(config.ADMIN),
    asyncWrapper(notification_controller.get_templates),
  )

  .patch(
    "/notification/templates/:id",
    verifyToken(config.ADMIN),
    asyncWrapper(notification_controller.update_template),
  )

  .patch(
    "/notification/templates/:id/toggle",
    verifyToken(config.ADMIN),
    asyncWrapper(notification_controller.toggle_template),
  )

  .get(
    "/notification/get-all",
    verifyToken(config.USER),
    asyncWrapper(notification_controller.get_all),
  )

  .get(
    "/notification/unread-count",
    verifyToken(config.USER),
    asyncWrapper(notification_controller.get_unread_count),
  )

  .patch(
    "/notification/read-all",
    verifyToken(config.USER),
    asyncWrapper(notification_controller.read_all),
  )

  .patch(
    "/notification/read/:id",
    verifyToken(config.USER),
    asyncWrapper(notification_controller.read),
  );
