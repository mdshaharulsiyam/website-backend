import Aggregator from "../../utils/Aggregator";
import { QueryKeys, SearchKeys } from "../../utils/Queries";
import { cart_model } from "./cart_model";
import { ICart } from "./cart_type";

const create = async (user_id: string, data: ICart) => {
  const existing_cart = await cart_model.findOne({
    user: user_id,
    product_id: data.product_id,
  });
  if (existing_cart) {
    await cart_model.findByIdAndUpdate(existing_cart._id, {
      color: data.color,
      size: data.size,
    });
    return {
      success: true,
      message: "Cart updated successfully",
    };
  }
  await cart_model.create({
    ...data,
    user: user_id,
  });

  return {
    success: true,
    message: "Cart created successfully",
  };
};

const get_all = async (queryKeys: QueryKeys, searchKeys: SearchKeys) => {
  return await Aggregator(cart_model, queryKeys, searchKeys, [
    {
      $lookup: {
        from: "products",
        localField: "product_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },

    {
      $addFields: {
        discount_amount: {
          $multiply: [
            "$product.price",
            { $divide: ["$product.discount", 100] },
          ],
        },

        price_after_discount: {
          $subtract: [
            "$product.price",
            {
              $multiply: [
                "$product.price",
                { $divide: ["$product.discount", 100] },
              ],
            },
          ],
        },
      },
    },

    {
      $addFields: {
        total_price: {
          $multiply: ["$product.price", "$quantity"],
        },

        total_discount_price: {
          $multiply: ["$price_after_discount", "$quantity"],
        },
      },
    },

    {
      $project: {
        _id: 1,
        user: 1,
        quantity: 1,
        color: 1,
        size: 1,

        product_id: 1,
        product_name: "$product.name",
        product_price: "$product.price",
        banner: { $arrayElemAt: ["$product.img", 0] },
        discount_amount: 1,
        price_after_discount: 1,
        total_price: 1,
        total_discount_price: 1,
      },
    },
  ]);
};

const update = async (user_id: string, id: string, quantity: number) => {
  const updated_cart = await cart_model.findOneAndUpdate(
    { _id: id, user: user_id },
    { quantity },
    { new: true },
  );

  if (!updated_cart) throw new Error("Cart not found");

  return {
    success: true,
    message: "Cart updated successfully",
  };
};

const delete_cart = async (id: string) => {
  const deletedCart = await cart_model.findByIdAndDelete(id);

  if (!deletedCart) throw new Error("Cart not found");

  return {
    success: true,
    message: "Cart deleted successfully",
  };
};

export const cart_service = Object.freeze({
  create,
  get_all,
  update,
  delete_cart,
});
