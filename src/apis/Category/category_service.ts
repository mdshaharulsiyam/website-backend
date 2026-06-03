import mongoose from "mongoose";
import { UnlinkFiles } from "../../middleware/fileUploader";
import Aggregator from "../../utils/Aggregator";
import { QueryKeys, SearchKeys } from "../../utils/Queries";
import { IAuth } from "../Auth/auth_types";
import { service_model } from "../Service/service_model";
import { category_model } from "./category_model";
async function create(data: { [key: string]: string }) {
  const existing_category = await category_model.findOne({ name: data?.name });
  if (existing_category) {
    const result = await category_model.updateOne(
      { _id: existing_category._id },
      { $set: { ...data, is_active: true } },
      { new: true },
    );
    return {
      success: true,
      message: "category created successfully",
      data: result,
    };
  } else {
    const result = await category_model.create(data);
    return {
      success: true,
      message: "category created successfully",
      data: result,
    };
  }
}

async function get_all(queryKeys: QueryKeys, searchKeys: SearchKeys) {
  return await Aggregator(category_model, queryKeys, searchKeys, [
    {
      $lookup: {
        from: "services",
        localField: "_id",
        foreignField: "category",
        as: "services",
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "category",
        as: "products",
      },
    },
    {
      $project: {
        name: 1,
        img: 1,
        _id: 1,
        is_active: 1,
        services: {
          $map: {
            input: {
              $filter: {
                input: "$services",
                as: "service",
                cond: { $eq: ["$$service.is_active", true] },
              },
            },
            as: "service",
            in: {
              _id: "$$service._id",
              name: "$$service.name",
            },
          },
        },
        total_service: {
          $size: {
            $filter: {
              input: "$services",
              as: "service",
              cond: { $eq: ["$$service.is_active", true] },
            },
          },
        },
        total_product: {
          $size: {
            $filter: {
              input: "$products",
              as: "product",
              cond: { $eq: ["$$product.is_deleted", false] },
            },
          },
        },
      },
    },
  ]);
}

async function update(id: string, data: { [key: string]: string }) {
  const category = await category_model.findById(id);

  if (!category) throw new Error("category not found");
  if (data?.img) UnlinkFiles([category?.img]);

  const result = await category_model.updateOne(
    { _id: id },
    {
      $set: {
        ...data,
      },
    },
    { new: true },
  );

  return {
    success: true,
    message: "category updated successfully",
    data: result,
  };
}

async function delete_category(
  id: string,
  data: { [key: string]: string },
  auth: IAuth,
) {
  // const is_exists = await category_model.findOne({ _id: id, name: data?.name });

  // if (!is_exists) throw new Error(`category not found`);

  // const is_pass_mass = await bcrypt.compare(data?.password, auth?.password);

  // if (!is_pass_mass) throw new Error(`password doesn't match`);

  const session = await mongoose.startSession();
  await session.startTransaction();

  try {
    await Promise.all([
      category_model.findOneAndUpdate(
        { _id: id },
        { $set: { is_active: false } },
        { session },
      ),
      service_model.updateMany(
        { category: id },
        { $set: { is_active: false } },
        { session },
      ),
    ]);
    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      message: "category deleted successfully",
    };
  } catch (error) {
    await session.startTransaction();
  } finally {
    await session.endSession();
  }
}

export const category_service = Object.freeze({
  create,
  get_all,
  update,
  delete_category,
});
