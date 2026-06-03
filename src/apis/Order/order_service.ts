import mongoose from "mongoose";
import Queries, { QueryKeys, SearchKeys } from "../../utils/Queries";
import { cart_model } from '../Cart/cart_model';
import { coupon_model } from '../Coupon/coupon_model';
import { product_model } from '../Product/product_model';
import { product_service } from '../Product/product_service';
import { order_model } from "./order_model";
import { IOrderItem } from "./order_type";

const create_order = async (data: any, user_id: string) => {
  const session = await mongoose.startSession();
  try {
    const result = await session.withTransaction(async () => {
      const {
        items,
        delivery_address,
        payment_method,
        coupon,
      } = data;
      let stock_promise: any[] = [];
      let total_amount = 0;

      const product_ids = items.map((item: IOrderItem) => new mongoose.Types.ObjectId(item.product));
      let searchKeys = {};

      let queryKeys = {
        _id: { $in: product_ids },
      };

      const [product_data, coupon_data]: any = await Promise.all([
        product_service.get_all(
          queryKeys,
          searchKeys,
          coupon
        ),
        coupon ? coupon_model.findOne({ name: coupon }) : null
      ]);

      if (coupon && !coupon_data) {
        throw new Error("Invalid coupon code");
      }

      const updated_items = items.map((item: IOrderItem) => {
        const product = product_data?.data?.find(
          (p: any) => p._id.toString() === item.product.toString()
        );

        if (!product) {
          throw new Error(`Product not found for id ${item.product}`);
        }
        if (
          coupon_data?.coupon_type == "product"
        ) {
          if (coupon && !product.coupon.available) {
            throw new Error(`Coupon is not available`);
          }
          if (coupon && product.coupon.coupon_code !== coupon) {
            throw new Error(`Invalid coupon code`);
          }
          if (coupon_data?.total_available == 0) {
            throw new Error(`Coupon is not available`);
          }
        }
        stock_promise.push(product_model.updateOne(
          { _id: item.product },
          { $inc: { stock: -item.quantity } }
        ));
        const price = product.price_after_discount;
        const total_price = price * item.quantity;
        total_amount += total_price;
        return {
          product: item.product,
          name: product.name,
          total_price,
          price,
          quantity: item.quantity,
          size: item.size || null,
          color: item.color || null,
        };
      });

      const order_data = {
        user: user_id,
        items: updated_items,
        total_amount,
        delivery_address,
        payment_method,
        ...(coupon_data ? {
          final_amount: total_amount - total_amount * (coupon_data?.percentage || 0) / 100,
          // final_amount: total_amount - Math.min(total_amount * (coupon_data?.percentage || 0) / 100, coupon_data?.max_discount || 0),
          coupon: coupon_data?.name,
          coupon_applied: true,
          discount: total_amount * (coupon_data?.percentage || 0) / 100
        } : {
          final_amount: total_amount,
          coupon: null,
          coupon_applied: false
        })
      };

      await order_model.create([order_data]);
      await coupon_model.updateOne({ name: coupon }, { $inc: { total_available: -1 } });
      await cart_model.deleteMany({ product_id: { $in: product_ids } });
      await Promise.all(stock_promise);

      return {
        success: true,
        message: "order created successfully",
      };
    });
    return result;
  } catch (error) {
    throw error;
  } finally {
    session.endSession();
  }
};

const get_all = async (
  queryKeys: QueryKeys,
  searchKeys: SearchKeys,
  populatePath?: any,
  selectFields?: string | string[],
  modelSelect?: string,
) => {
  return await Queries(
    order_model,
    queryKeys,
    searchKeys,
    populatePath,
    selectFields,
    modelSelect,
  );
};

const get_order_details = async (id: string) => {
  const order_details = await order_model
    .findById(id)
    .populate({
      path: "user",
      select: "name email img",
    })
    .populate({
      path: "items.product",
      select: "name price img",
    });
  return {
    success: true,
    message: "order data retrieved successfully",
    data: order_details,
  };
};

const update_order = async (id: string, data: any) => {
  const updated_order = await order_model.findByIdAndUpdate(id, data, {
    new: true,
  });

  if (!updated_order) throw new Error("Order not found");

  return {
    success: true,
    message: "Order updated successfully",
    data: updated_order,
  };
};

const delete_order = async (id: string) => {
  const deleted_order = await order_model.findByIdAndDelete(id);

  if (!deleted_order) throw new Error("Order not found");

  return {
    success: true,
    message: "Order deleted successfully",
    data: deleted_order,
  };
};

const update_delivery_status = async (id: string, delivery_status: string) => {
  const updated_order = await order_model.findByIdAndUpdate(
    id,
    { delivery_status },
    { new: true },
  );

  if (!updated_order) throw new Error("Order not found");

  return {
    success: true,
    message: "Order updated successfully",
    data: updated_order,
  };
};

export const order_service = Object.freeze({
  create_order,
  get_all,
  get_order_details,
  update_order,
  delete_order,
  update_delivery_status,
});
