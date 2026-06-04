import express, { Request } from "express";
import asyncWrapper from "../../middleware/asyncWrapper";
import { auth_controller } from "./auth_controller";
import verifyToken from "../../middleware/verifyToken";
import config from "../../DefaultConfig/config";
import uploadFile from "../../middleware/fileUploader";
import rateLimit from "express-rate-limit";
import validateRequest from "../../middleware/validateRequest";
import { auth_validate } from "./auth_validate";
export const auth_router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 4,
  handler: (req, res) => {
    // console.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).send({
      success: false,
      message: "Too many requests please try after 1 hour",
    });
  },
});

auth_router
  .post(
    "/auth/sign-up",
    validateRequest(auth_validate.sign_up_validation),
    verifyToken(config.USER, false),
    asyncWrapper(auth_controller.create),
  )

  .post(
    "/auth/sign-in",
    validateRequest(auth_validate.login_validation),
    asyncWrapper(auth_controller.sing_in),
  )

  .post(
    "/auth/reset-password",
    validateRequest(auth_validate.reset_password_validate),
    verifyToken(config.USER, true, config.ACCESS_TOKEN_NAME),
    asyncWrapper(auth_controller.reset_password),
  )

  .post(
    "/auth/change-password",
    validateRequest(auth_validate.change_password_validate),
    verifyToken(config.USER),
    asyncWrapper(auth_controller.change_password),
  )

  .patch(
    "/auth/update-profile",
    verifyToken(config.USER),
    uploadFile(),
    asyncWrapper(auth_controller.update_auth),
  )

  .get(
    "/auth/get-all-users",
    verifyToken(config.ADMIN),
    asyncWrapper(auth_controller.get_all_users),
  )

  .get(
    "/auth/profile",
    uploadFile(),
    verifyToken(config.USER),
    asyncWrapper(auth_controller.get_profile),
  )

  .post("/auth/logout", asyncWrapper(auth_controller.sing_out))

  .patch(
    "/auth/verify-identity/:id",
    verifyToken(config.ADMIN),
    asyncWrapper(auth_controller.verify_identity),
  )

  .patch(
    "/auth/block/:id",
    verifyToken(config.ADMIN),
    asyncWrapper(auth_controller.block_auth),
  )

  .post(
    "/auth/create-admin",
    validateRequest(auth_validate.create_admin_validation),
    verifyToken(config.SUPER_ADMIN),
    asyncWrapper(auth_controller.create_admin),
  )

  .get(
    "/auth/get-all-admins",
    verifyToken(config.SUPER_ADMIN),
    asyncWrapper(auth_controller.get_all_admins),
  )

  .patch(
    "/auth/change-role/:id",
    validateRequest(auth_validate.change_role_validation),
    verifyToken(config.SUPER_ADMIN),
    asyncWrapper(auth_controller.change_role),
  )

  .delete(
    "/auth/delete-admin/:id",
    verifyToken(config.SUPER_ADMIN),
    asyncWrapper(auth_controller.delete_admin),
  );
// , undefined, undefined, async (req: Request) => {
//   const [category, banner] = await Promise.all([
//     category_model.find(),
//     banner_model.find()
//   ])
//   return { category, banner }
// }
