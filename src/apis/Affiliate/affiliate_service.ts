import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import auth_model from "../Auth/auth_model";
import { IAuth } from "../Auth/auth_types";
import { coupon_model } from "../Coupon/coupon_model";
import { order_model } from "../Order/order_model";
import { product_model } from "../Product/product_model";
import { affiliate_link_model } from "./affiliate_link_model";
import { referral_order_model } from "./referral_order_model";
import { withdrawal_request_model } from "./withdrawal_request_model";

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

async function checkout_affiliate(data: any, auth: IAuth) {
  const { refId, items, delivery_address, payment_method, coupon, ...otherOrderFields } = data;

  if (!refId) {
    throw new Error("Missing affiliate reference ID");
  }

  const product_ids = items.map((item: any) => new Types.ObjectId(item.product));
  const products = await product_model.find({ _id: { $in: product_ids } });

  let coupon_data: any = null;
  if (coupon) {
    coupon_data = await coupon_model.findOne({ name: coupon });
    if (!coupon_data) {
      throw new Error("Invalid coupon code");
    }
  }

  let total_amount = 0;
  const updated_items = [];
  const stock_promises = [];

  for (const item of items) {
    const product = products.find((p: any) => p._id.toString() === item.product.toString());
    if (!product) {
      throw new Error(`Product not found for id ${item.product}`);
    }

    const price = product.price - (product.price * (product.discount || 0)) / 100;
    const total_price = price * item.quantity;
    total_amount += total_price;

    updated_items.push({
      product: item.product,
      name: product.name,
      price: price,
      total_price: total_price,
      quantity: item.quantity,
      size: item.size || null,
      color: item.color || null,
    });

    stock_promises.push(
      product_model.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity } })
    );
  }

  let final_amount = total_amount;
  let discount_amount = 0;

  if (coupon_data) {
    discount_amount = (total_amount * (coupon_data.percentage || 0)) / 100;
    final_amount = total_amount - discount_amount;
    await coupon_model.updateOne({ name: coupon }, { $inc: { total_available: -1 } });
  }

  await Promise.all(stock_promises);

  // 1. Create standard order
  const order = await order_model.create({
    user: auth._id,
    items: updated_items,
    delivery_address,
    payment_method,
    total_amount,
    final_amount,
    coupon: coupon_data ? coupon_data.name : null,
    coupon_applied: !!coupon_data,
    discount: discount_amount,
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

async function approve_referral_on_delivery(order_id: string) {
  const referral = await referral_order_model.findOne({ order_id, payment_status: "Pending" });
  if (referral) {
    referral.payment_status = "Approved";
    await referral.save();
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
}

async function get_affiliate_orders(auth: IAuth) {
  const orders = await referral_order_model
    .find({ affiliate_id: auth._id })
    .populate("order_id")
    .sort({ createdAt: -1 });

  return {
    success: true,
    message: "Affiliate orders fetched",
    data: orders
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
  approve_referral_on_delivery,
  get_affiliate_orders,
  create_withdrawal,
  get_withdrawals,
  admin_get_referral_orders,
  admin_update_referral_order,
  admin_get_withdrawals,
  admin_update_withdrawal,
});
