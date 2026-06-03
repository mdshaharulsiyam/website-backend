import mongoose from "mongoose";
import { IPaymentData } from "../../types/data_types";
import { payment_model } from "./payment_model";
import auth_model from "../Auth/auth_model";
import config from "../../DefaultConfig/config";
import { notification_model } from "../Notifications/notification_model";
import { stripe } from "./payment_controller";
import { currency_list_code } from "../../utils/stripe/stripe_currency";
import { country_list_code } from "../../utils/stripe/strupe_country";
import { Request } from "express";
import { IAuth } from "../Auth/auth_types";
import bcrypt from "bcrypt";

// const SSLCommerzPayment = require("sslcommerz-lts");
async function validate_stripe_country_currency(
  country_currency: string,
  type: "currency" | "country",
) {
  if (type === "currency") {
    return currency_list_code.includes(country_currency);
  } else {
    return country_list_code.includes(country_currency);
  }
}

async function calculate_amount(price_data: IPaymentData[]) {
  return price_data
    ? price_data.reduce((total, item) => {
        const unitAmount = Number(item.unit_amount) ?? 0;
        const quantity = Number(item.quantity) ?? 1;
        return total + unitAmount * quantity;
      }, 0)
    : 0;
}

async function create(data: { [key: string]: string | number | boolean }) {
  await payment_model.insertMany(data);
  return {
    success: true,
    message: "payment created successfully",
  };
}

async function success_payment(
  data: { status: boolean; transaction_id: string },
  session_id: string,
) {
  const session = await mongoose.startSession();
  try {
    const result = await session.withTransaction(async () => {
      const is_exists_payment = await payment_model.findOne({ session_id });

      if (!is_exists_payment) throw new Error(`payment not found`);

      const [result] = await Promise.all([
        payment_model.findByIdAndUpdate(
          is_exists_payment?._id,
          {
            $set: {
              ...data,
            },
          },
          { session },
        ),
        auth_model.findByIdAndUpdate(
          is_exists_payment?.user,
          {
            $inc: {
              credits: is_exists_payment?.amount * config.CREDITS_PER_DOLLAR,
            },
          },
          { session },
        ),

        notification_model.insertMany(
          [
            {
              user: is_exists_payment?.user,
              title: "payment success",
              message: `payment of $${is_exists_payment?.amount} is success`,
            },
            {
              user: is_exists_payment?.user,
              title: "credit added",
              message: `you have added $${is_exists_payment?.amount * config.CREDITS_PER_DOLLAR} credits`,
            },
          ],
          { session },
        ),
      ]);
      return result;
    });
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
}

async function refund(
  payment_intent: string,
  user_password: string,
  inserted_password: string,
  amount?: string | number,
) {
  const is_match_pass = await bcrypt.compare(user_password, inserted_password);

  if (!is_match_pass) throw new Error(`invalid credentials`);

  const refund = await stripe.refunds.create({
    payment_intent: payment_intent,
    ...(amount && { amount: Number(amount) }),
  });

  if (refund?.id) {
    await payment_model.updateOne(
      { transaction_id: payment_intent },
      { $set: { refund: refund?.id } },
    );
    return {
      success: true,
      message: "refund success",
    };
  } else {
    return {
      success: false,
      message: "refund failed",
    };
  }
}

async function update_account_onboarding(id: string, req: Request) {
  const onboarding_link = await stripe.accountLinks.create({
    account: id,
    refresh_url: `${req.protocol + "://" + req.get("host")}/payment/refresh_account_connect/${id}`,
    return_url: `${req.protocol + "://" + req.get("host")}/payment/success-account/${id}`,
    type: "account_onboarding",
  });
  return onboarding_link?.url;
}

async function create_account(email: string, country: string) {
  const account = await stripe.accounts.create({
    type: "express",
    email: email ?? "example@gmail.com",
    country: country ?? "US",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  return account?.id;
}

async function transfer_balance(
  account_id: string,
  amount: number,
  currency?: string,
) {
  if (currency) {
    const is_valid = await payment_service.validate_stripe_country_currency(
      currency,
      "currency",
    );
    if (!is_valid) throw new Error(`invalid currency`);
  }

  const transfer = await stripe.transfers.create({
    amount: amount,
    currency: currency ?? "usd",
    destination: account_id,
  });

  if (!transfer?.id) throw new Error("transfer failed");

  return { success: true, message: `balance transferred successfully` };
}

async function check_payment_status(id: string) {
  const session = await stripe.checkout.sessions.retrieve(id);
  const payment_intent = session?.payment_intent;

  const payment_intent_retrieve = await stripe.paymentIntents.retrieve(
    payment_intent as string,
  );

  if (
    !payment_intent_retrieve ||
    payment_intent_retrieve.amount_received === 0
  ) {
    throw new Error("Payment Not Succeeded");
  }
  await payment_model.updateOne({ session_id: id }, { $set: { status: true } });

  return {
    success: true,
    message: "payment success",
  };
}

async function validate_transfer_balance(
  user: IAuth,
  data: { [key: string]: string | number },
) {
  const is_match_pass = await bcrypt.compare(
    data?.password as string,
    user?.password,
  );

  if (!is_match_pass) throw new Error(`invalid credentials`);

  const result = await auth_model.findById(data?.id);

  if (!result) throw new Error(`user not found`);

  if (!result?.stripe?.stripe_account_id)
    throw new Error(`stripe account not created`);

  if (!result?.stripe?.is_account_complete)
    throw new Error(`stripe account not completed`);

  return result?.stripe?.stripe_account_id;
}

async function ssl_init(data: { [key: string]: string }, user?: IAuth) {
  const formatted_data = {
    total_amount: 100,
    currency: "BDT",
    tran_id: "REF123",
    success_url: "http://localhost:3030/success",
    fail_url: "http://localhost:3030/fail",
    cancel_url: "http://localhost:3030/cancel",
    ipn_url: "http://localhost:3030/ipn",
    shipping_method: "Courier",
    product_name: "Computer.",
    product_category: "Electronic",
    product_profile: "general",
    cus_name: "Customer Name",
    cus_email: "customer@example.com",
    cus_add1: "Dhaka",
    cus_add2: "Dhaka",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone: "01711111111",
    cus_fax: "01711111111",
    ship_name: "Customer Name",
    ship_add1: "Dhaka",
    ship_add2: "Dhaka",
    ship_city: "Dhaka",
    ship_state: "Dhaka",
    ship_postcode: 1000,
    ship_country: "Bangladesh",
  };

  // const sslcz = new SSLCommerzPayment(
  //   config?.STORE_ID,
  //   config?.STORE_PASSWORD,
  //   config?.IS_ALIVE,
  // );
}

export const payment_service = Object.freeze({
  create,
  calculate_amount,
  success_payment,
  validate_stripe_country_currency,
  update_account_onboarding,
  create_account,
  check_payment_status,
  transfer_balance,
  refund,
  validate_transfer_balance,
});
