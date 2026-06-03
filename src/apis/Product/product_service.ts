import Aggregator from '../../utils/Aggregator';
import mongoose, { PipelineStage } from "mongoose";
import { QueryKeys, SearchKeys } from "../../utils/Queries";
import { product_model } from "./product_model";
import IProduct from "./product_type";
// interface IParameters extends IProduct {
//     deleted_images: string
//     retained_images: string
//     coupon_code: string
// }

const escapeRegex = (str: string): string => {
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

const productComputedFields = {
  averageRating: { $ifNull: [{ $avg: "$reviews.rating" }, 0] },
  totalReviews: { $size: "$reviews" },
  discount_amount: {
    $multiply: [
      "$price",
      { $divide: [{ $ifNull: ["$discount", 0] }, 100] },
    ],
  },
  price_after_discount: {
    $subtract: [
      "$price",
      {
        $multiply: [
          "$price",
          { $divide: [{ $ifNull: ["$discount", 0] }, 100] },
        ],
      },
    ],
  },
};

const normalizeFilterValue = (value: any): any => {
  if (value instanceof mongoose.Types.ObjectId) return value;

  if (Array.isArray(value)) {
    return value.map((item) => normalizeFilterValue(item));
  }

  if (value && typeof value === "object") {
    return Object.keys(value).reduce((acc, key) => {
      acc[key] = normalizeFilterValue(value[key]);
      return acc;
    }, {} as Record<string, any>);
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (trimmedValue === "true") return true;
    if (trimmedValue === "false") return false;
    if (mongoose.Types.ObjectId.isValid(trimmedValue)) {
      return new mongoose.Types.ObjectId(trimmedValue);
    }
    if (trimmedValue !== "" && !Number.isNaN(Number(trimmedValue))) {
      return Number(trimmedValue);
    }
  }

  return value;
};

const shouldApplyFilter = (value: any) => {
  return value !== undefined && value !== "undefined" && value !== "";
};

const buildProductMatchStages = (
  queryKeys: QueryKeys,
  searchKeys: SearchKeys,
) => {
  const { limit, page, sort, order, averageRating, price_after_discount, ...filters } = queryKeys;
  const preMatchStage: Record<string, any> = {};
  const postMatchStage: Record<string, any> = {};

  if (Object.keys(searchKeys).length > 0) {
    preMatchStage.$or = Object.keys(searchKeys)
      .map((key) => ({
        [key]: { $regex: escapeRegex(searchKeys[key]), $options: "i" },
      }))
      .filter((item) => Object.keys(item).length > 0);
  }

  Object.keys(filters).forEach((key) => {
    const value = filters[key];

    if (shouldApplyFilter(value)) {
      preMatchStage[key] = normalizeFilterValue(value);
    }
  });

  if (shouldApplyFilter(averageRating)) {
    postMatchStage.averageRating = normalizeFilterValue(averageRating);
  }

  if (shouldApplyFilter(price_after_discount)) {
    postMatchStage.price_after_discount = normalizeFilterValue(price_after_discount);
  }

  return {
    limit,
    page,
    sort,
    order,
    preMatchStage,
    postMatchStage,
  };
};

const getPositiveInteger = (value: any, fallback: number) => {
  const parsedValue = parseInt(String(value || ""), 10);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
};

const create = async (body: IProduct) => {
  await product_model.create(body);
  return {
    success: true,
    message: "product created successfully",
  };
};

const get_all = async (
  queryKeys: QueryKeys,
  searchKeys: SearchKeys,
  coupon?: boolean
) => {
  const {
    limit,
    page,
    sort,
    order,
    preMatchStage,
    postMatchStage,
  } = buildProductMatchStages(queryKeys, searchKeys);

  const itemsPerPage = getPositiveInteger(limit, 10);
  const currentPage = getPositiveInteger(page, 1);
  const sortStage: Record<string, 1 | -1> = {};
  const sortKey = typeof sort === "string" ? sort.trim() : "";

  if (sortKey) {
    sortStage[sortKey] = order === "desc" ? -1 : 1;
  }

  const basePipeline: PipelineStage[] = [
    ...(Object.keys(preMatchStage).length > 0 ? [{ $match: preMatchStage }] : []),
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "product",
        as: "reviews",
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $lookup: {
        from: "services",
        localField: "sub_category",
        foreignField: "_id",
        as: "sub_category",
      },
    },
    {
      $addFields: productComputedFields,
    },
    ...(Object.keys(postMatchStage).length > 0 ? [{ $match: postMatchStage }] : []),
  ];

  const [result] = await product_model.aggregate([
    ...basePipeline,
    {
      $facet: {
        data: [
          ...(Object.entries(sortStage).length > 0 ? [{ $sort: sortStage }] : []),
          { $skip: (currentPage - 1) * itemsPerPage },
          { $limit: itemsPerPage },
          {
            $project: {
              averageRating: 1,
              price_after_discount: 1,
              totalReviews: 1,
              _id: 1,
              name: 1,
              price: 1,
              banner: { $arrayElemAt: ["$img", 0] },
              category_name: { $arrayElemAt: ["$category.name", 0] },
              sub_category_name: { $arrayElemAt: ["$sub_category.name", 0] },
              discount: 1,
              flag: 1,
              tag: 1,
              ...(coupon ? { coupon: 1 } : {}),
            },
          },
        ],
        totalItems: [{ $count: "count" }],
      },
    },
  ]);

  const totalItems = result?.totalItems?.[0]?.count || 0;

  return {
    success: true,
    data: result?.data || [],
    pagination: {
      currentPage,
      itemsPerPage,
      totalItems,
      totalPages: Math.ceil(totalItems / itemsPerPage),
    },
  };
};

const get_details = async (id: string) => {
  const queryKeys: QueryKeys = {
    _id: id,
  };
  const searchKeys: SearchKeys = {};
  const product: any = await Aggregator(
    product_model,
    queryKeys,
    searchKeys,
    [
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "product",
          as: "reviews",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $lookup: {
          from: "services",
          localField: "sub_category",
          foreignField: "_id",
          as: "sub_category",
        },
      },
      {
        $addFields: {
          ...productComputedFields,
        },
      },
      {
        $project: {
          averageRating: 1,
          price_after_discount: 1,
          totalReviews: 1,
          _id: 1,
          name: 1,
          banner: { $arrayElemAt: ["$img", 0] },
          img: 1,
          category_name: { $arrayElemAt: ["$category.name", 0] },
          sub_category_name: { $arrayElemAt: ["$sub_category.name", 0] },
          category_id: { $arrayElemAt: ["$category._id", 0] },
          sub_category_id: { $arrayElemAt: ["$sub_category._id", 0] },
          discount: 1,
          price: 1,
          flag: 1,
          tag: 1,
          size: 1,
          color: 1,
          gender: 1,
          description:1,
          stock: 1,
        },
      },
    ],
  );
  return {
    success: true,
    message: "product data retrieved successfully",
    data: product?.data?.[0] || null,
  };
};

const update_product = async (id: string, user: string, body: IProduct) => {

  await product_model.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        ...body,
      },
    },
    { new: true },
  );

  return {
    success: true,
    message: "product updated successfully",
  };
};

const delete_product = async (id: string, user: string) => {



  const product = await product_model.findOne({ _id: id });

  if (!product) throw new Error("Product not found");

  // if (product?.img) UnlinkFiles(product?.img);

  await product_model.findOneAndUpdate({ _id: id }, { $set: { is_deleted: true } }, { new: true });

  return {
    success: true,
    message: "product deleted successfully",
  };
};



export const product_service = Object.freeze({
  create,
  get_all,
  get_details,
  update_product,
  delete_product,
});
