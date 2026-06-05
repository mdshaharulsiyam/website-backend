import Queries, { SearchKeys } from "../../utils/Queries";
import { product_model } from "../Product/product_model";
import { coupon_model } from "./coupon_model";
import ICoupon from "./coupon_type";

const create = async (data: ICoupon) => {
  await coupon_model.create(data);

  return {
    success: true,
    message: "coupon created successfully",
  };
};

const update = async (id: string, data: ICoupon) => {
  await coupon_model.findByIdAndUpdate(
    id,
    {
      $set: {
        ...data,
      },
    },
    { new: true },
  );

  return {
    success: true,
    message: "coupon updated successfully",
  };
};

const delete_coupon = async (id: string) => {
  await coupon_model.findByIdAndDelete(id);

  return {
    success: true,
    message: "coupon deleted successfully",
  };
};

const check_coupon = async (
  name: string,
  items: { product_id: string; price: number; quantity: number }[] = [],
  total_amount: number = 0
) => {
  const coupon = await coupon_model.findOne({ name });

  if (!coupon?._id) throw new Error(`coupon not found`);

  if (coupon?.total_available == 0)
    throw new Error(`this coupon limit has been ended`);

  if (total_amount < (coupon.min_spend || 0)) {
    throw new Error(`Minimum spend of ৳${coupon.min_spend} is required for this coupon`);
  }

  let discount = 0;

  if (coupon.coupon_type === "product") {
    if (!Array.isArray(items) || items.length === 0)
      throw new Error(`Items are required for product-specific coupons`);

    const product_ids = items.map((item) => item.product_id);

    const products = await product_model
      .find({
        _id: { $in: product_ids },
        is_deleted: false,
      })
      .select("coupon name")
      .lean();

    let eligible_amount = 0;

    items.forEach((item) => {
      const product = products.find(
        (p) => p._id.toString() === item.product_id.toString()
      );
      if (
        product &&
        product.coupon?.available &&
        product.coupon?.coupon_code === coupon.name
      ) {
        eligible_amount += item.price * item.quantity;
      }
    });

    if (eligible_amount === 0) {
      throw new Error(`No eligible products in cart for this coupon`);
    }

    discount = eligible_amount * (coupon.percentage / 100);
  } else {
    discount = total_amount * (coupon.percentage / 100);
  }

  if (coupon.max_discount && coupon.max_discount > 0) {
    discount = Math.min(discount, coupon.max_discount);
  }

  return {
    success: true,
    message: "coupon applied successfully",
    data: { ...coupon.toObject(), calculated_discount: discount },
  };
};

const get_all = async (queryKeys: SearchKeys, searchKeys: SearchKeys) => {
  return await Queries(coupon_model, queryKeys, searchKeys);
};

export const coupon_service = Object.freeze({
  create,
  update,
  delete_coupon,
  check_coupon,
  get_all,
});
