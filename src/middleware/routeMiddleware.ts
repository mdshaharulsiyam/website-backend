import express, { Express, Request, Response } from "express";
import path from "path";
import { auth_router } from "../apis/Auth/auth_route";
import { banner_router } from "../apis/Banner/banner_route";
import { business_router } from "../apis/Business/business_route";
import { cart_router } from "../apis/Cart/cart_route";
import { category_router } from "../apis/Category/category_route";
import { coupon_router } from "../apis/Coupon/coupon_route";
import { districts_router } from '../apis/districts/districts_route';
import { divisions_router } from '../apis/divisions/divisions_route';
import { faq_router } from "../apis/faq/faq_route";
import { notification_router } from "../apis/Notifications/notification_route";
import { order_router } from "../apis/Order/order_route";
import { overview_router } from "../apis/Overview/overview_route";
import { payment_route } from "../apis/Payment/payment_route";
import { product_router } from "../apis/Product/product_route";
import { review_router } from "../apis/Review/review_route";
import { service_router } from "../apis/Service/service_route";
import { setting_router } from "../apis/Setting/setting_router";
import { shipping_address_router } from "../apis/ShippingAddress/shipping_address_route";
import { union_router } from '../apis/union/union_route';
import { upazilas_router } from '../apis/upazilas/upazilas_route';
import { verification_router } from "../apis/Verification/verification_route";
import { sendMail } from "../utils/sendMail";
import asyncWrapper from "./asyncWrapper";

export const routeMiddleware = (app: Express) => {
  app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

  app.post(
    "/send-email",
    asyncWrapper(async (req: Request, res: Response) => {
      const { receiver, name, question } = req.body;

      if (!receiver || !name || !question)
        throw new Error("All fields are required");

      const result = await sendMail.sendQuestionMail(receiver, name, question);
      console.log(result);
      res.status(200).send({
        success: true,
        message: "Contact Email sent successfully",
      });
    }),
  );

  app.use(auth_router);
  app.use(verification_router);
  app.use(category_router);
  app.use(service_router);
  app.use(review_router);
  app.use(notification_router);
  app.use(setting_router);
  app.use(overview_router);
  app.use(payment_route);
  app.use(banner_router);
  app.use(coupon_router);
  app.use(cart_router);
  app.use(order_router);
  app.use(shipping_address_router);
  app.use(product_router);
  app.use(business_router);
  app.use(faq_router);
  app.use(union_router);
  app.use(upazilas_router);
  app.use(districts_router);
  app.use(divisions_router);
};
