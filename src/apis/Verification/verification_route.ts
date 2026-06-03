import express from "express";
import asyncWrapper from "../../middleware/asyncWrapper";
import { verification_controller } from "./verification_controller";

export const verification_router = express.Router();

verification_router
  .post("/verification/create", asyncWrapper(verification_controller.create))
  .post("/verification/verify", asyncWrapper(verification_controller.verify));
