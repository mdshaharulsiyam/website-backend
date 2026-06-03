import Queries, { QueryKeys, SearchKeys } from "../../utils/Queries";
import { review_model } from "./review_model";

async function create(data: { [key: string]: string }) {
  const { rating, description, img, user, review_for, product } = data;

  await review_model.create([
    {
      description,
      img,
      review_for,
      rating: Number(rating),
      user,
      ...(review_for === "PRODUCT" && { product }),
    },
  ]);

  return {
    success: true,
    message: "review created successfully",
  };
};



async function delete_review(id: string) {
  const result = await review_model.findByIdAndDelete({ _id: id });
  return {
    success: true,
    message: "review deleted successfully",
    data: result,
  };
}



async function get_all(
  queryKeys: QueryKeys,
  searchKeys: SearchKeys,
  populatePath?: string | string[],
  selectFields?: string | string[],
  modelSelect?: string,
) {
  return await Queries(
    review_model,
    queryKeys,
    searchKeys,
    populatePath,
    selectFields,
    modelSelect,
  );
}

export const review_service = Object.freeze({
  create,
  delete_review,
  get_all,
});
