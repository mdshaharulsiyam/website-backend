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

const check_coupon = async (name: string, product_id: string[]) => {
  const coupon = await coupon_model.findOne({ name });

  if (!coupon?._id) throw new Error(`coupon not found`);

  if (coupon?.total_available == 0)
    throw new Error(`this coupon limit has been ended`);

  if (coupon.coupon_type === "product") {
    if (!Array.isArray(product_id) || product_id.length === 0)
      throw new Error(`product id is required for this coupon`);

    const products = await product_model
      .find({
        _id: { $in: product_id },
        is_deleted: false,
      })
      .select("coupon name")
      .lean();

    if (products.length !== product_id.length)
      throw new Error(`Not all products are eligible for this coupon`);

    const unavailable_product = products.find(
      (product) => !product.coupon?.available,
    );

    if (unavailable_product)
      throw new Error(`Not all products are eligible for this coupon`);

    const invalid_coupon_product = products.find(
      (product) => product.coupon?.coupon_code !== coupon.name,
    );

    if (invalid_coupon_product)
      throw new Error(`Not all products are eligible for this coupon`);
  }

  return {
    success: true,
    message: "coupon applied successfully",
    data: coupon,
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
