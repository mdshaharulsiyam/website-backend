import { Types } from "mongoose";
import jwt from "jsonwebtoken";
import { IAuth } from "../Auth/auth_types";
import auth_model from "../Auth/auth_model";
import { referral_order_model } from "./referral_order_model";
import { withdrawal_request_model } from "./withdrawal_request_model";
import { affiliate_link_model } from "./affiliate_link_model";
import { order_model } from "../Order/order_model";

async function generate_link(product_id: string, auth: IAuth) {
  if (!auth.is_affiliate) {
    throw new Error("User is not an approved affiliate");
  }

  // Create or find an affiliate link tracking entry
  let link = await affiliate_link_model.findOne({ affiliate_id: auth._id, product_id });
  if (!link) {
    link = await affiliate_link_model.create({
      affiliate_id: auth._id,
      product_id,
      clicks: 0,
    });
  }

  const token = jwt.sign({ ref: auth._id }, 'ECOM_SECURE_URL_SECRET_KEY_123');

  // Return the link data and the generic URL structure (frontend decides the base domain)
  return {
    success: true,
    message: "Affiliate link generated",
    data: {
      refId: auth._id,
      productId: product_id,
      linkId: link._id,
      url: `/products/${product_id}?token=${token}`
    }
  };
}

async function track_click(affiliate_id: string, product_id: string) {
  await affiliate_link_model.updateOne(
    { affiliate_id, product_id },
    { $inc: { clicks: 1 } },
    { upsert: true }
  );
  return { success: true, message: "Click tracked" };
}

// In a real scenario, this checkout function would also place the standard order.
// To keep it focused, it assumes order data is provided and creates BOTH the order and referral.
async function checkout_affiliate(data: any, auth: IAuth) {
  const { refId, items, delivery_address, payment_method, ...otherOrderFields } = data;

  if (!refId) {
    throw new Error("Missing affiliate reference ID");
  }

  // Calculate total amount (mock logic assuming items has price and quantity)
  let total_amount = 0;
  for (const item of items) {
    total_amount += item.price * item.quantity;
    item.total_price = item.price * item.quantity;
  }
  
  const final_amount = total_amount - (data.discount || 0);

  // 1. Create standard order
  const order = await order_model.create({
    user: auth._id,
    items,
    delivery_address,
    payment_method,
    total_amount,
    final_amount,
    ...otherOrderFields
  });

  // 2. Calculate commission (4% of final_amount)
  const commission_amount = (final_amount * 4) / 100;

  // 3. Create ReferralOrder as Pending
  const referral_order = await referral_order_model.create({
    order_id: order._id,
    affiliate_id: refId,
    customer_id: auth._id,
    commission_amount,
    payment_status: "Pending"
  });

  return {
    success: true,
    message: "Affiliate order placed successfully",
    data: {
      order,
      referral_order
    }
  };
}

async function create_withdrawal(data: { bkash_number: string, amount: number }, auth: IAuth) {
  const user = await auth_model.findById(auth._id);
  if (!user || !user.is_affiliate) {
    throw new Error("User is not an active affiliate");
  }

  if (user.current_balance < data.amount) {
    throw new Error("Insufficient balance");
  }

  // Deduct/lock the balance immediately to prevent double spending
  user.current_balance -= data.amount;
  await user.save();

  const withdrawal = await withdrawal_request_model.create({
    user_id: auth._id,
    bkash_number: data.bkash_number,
    amount: data.amount,
    status: "Pending"
  });

  return {
    success: true,
    message: "Withdrawal request submitted successfully",
    data: withdrawal
  };
}

async function get_withdrawals(auth: IAuth) {
  const withdrawals = await withdrawal_request_model.find({ user_id: auth._id }).sort({ createdAt: -1 });
  return {
    success: true,
    message: "Withdrawals fetched successfully",
    data: withdrawals
  };
}

async function admin_get_referral_orders() {
  const orders = await referral_order_model
    .find()
    .populate("affiliate_id", "name email")
    .populate("customer_id", "name email")
    .populate("order_id", "final_amount total_amount")
    .sort({ createdAt: -1 });
    
  return {
    success: true,
    message: "Referral orders fetched",
    data: orders
  };
}

async function admin_update_referral_order(id: string, status: "Pending" | "Approved" | "Refunded") {
  const referral = await referral_order_model.findById(id);
  if (!referral) {
    throw new Error("Referral order not found");
  }

  if (referral.payment_status === "Approved") {
    throw new Error("Referral already approved");
  }

  referral.payment_status = status;
  await referral.save();

  // If approved, add money to affiliate
  if (status === "Approved") {
    await auth_model.updateOne(
      { _id: referral.affiliate_id },
      { 
        $inc: { 
          total_earnings: referral.commission_amount,
          current_balance: referral.commission_amount
        } 
      }
    );
  }

  return {
    success: true,
    message: `Referral order marked as ${status}`,
    data: referral
  };
}

async function admin_get_withdrawals() {
  const withdrawals = await withdrawal_request_model
    .find()
    .populate("user_id", "name email current_balance total_earnings")
    .sort({ createdAt: -1 });

  return {
    success: true,
    message: "Withdrawal requests fetched",
    data: withdrawals
  };
}

async function admin_update_withdrawal(id: string, status: "Pending" | "Processing" | "Completed" | "Rejected") {
  const withdrawal = await withdrawal_request_model.findById(id);
  if (!withdrawal) {
    throw new Error("Withdrawal request not found");
  }

  if (withdrawal.status === "Completed" || withdrawal.status === "Rejected") {
    throw new Error("Cannot change status of a completed or rejected request");
  }

  withdrawal.status = status;
  await withdrawal.save();

  // If rejected, refund the locked amount back to affiliate's current_balance
  if (status === "Rejected") {
    await auth_model.updateOne(
      { _id: withdrawal.user_id },
      { $inc: { current_balance: withdrawal.amount } }
    );
  } else if (status === "Completed") {
    await auth_model.updateOne(
      { _id: withdrawal.user_id },
      { $inc: { withdrawn_amount: withdrawal.amount } }
    );
  }

  return {
    success: true,
    message: `Withdrawal request marked as ${status}`,
    data: withdrawal
  };
}

export const affiliate_service = Object.freeze({
  generate_link,
  track_click,
  checkout_affiliate,
  create_withdrawal,
  get_withdrawals,
  admin_get_referral_orders,
  admin_update_referral_order,
  admin_get_withdrawals,
  admin_update_withdrawal,
});
