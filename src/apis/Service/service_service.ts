import { service_model } from "./service_model";
import Queries, { QueryKeys, SearchKeys } from "../../utils/Queries";
import { UnlinkFiles } from "../../middleware/fileUploader";
import { category_model } from "../Category/category_model";

async function create(data: { [key: string]: string }) {
  const category = await category_model.findById(data.category);
  if (!category) throw new Error("category not found");

  const result = await service_model.insertMany(data);
  return {
    success: true,
    message: "service created successfully",
    data: result,
  };
}

async function update(id: string, data: { [key: string]: string }) {
  const [existing_service, category] = await Promise.all([
    service_model.findById(id),
    data?.category ? category_model.findById(data.category) : null,
  ]);

  if (!existing_service) throw new Error("service not found");
  if (data?.category && !category) throw new Error("category not found");

  const result = await service_model.updateOne(
    { _id: id },
    {
      $set: {
        ...data,
      },
    },
    { new: true },
  );

  if (data?.img) UnlinkFiles([existing_service.img]);

  return {
    success: true,
    message: "service updated successfully",
    data: result,
  };
}

async function delete_service(id: string) {
  const existing_service = await service_model.findById(id);
  if (!existing_service) throw new Error("service not found");

  const result = service_model.findByIdAndDelete(id);

  return {
    success: true,
    message: "service deleted successfully",
    data: result,
  };
}
async function get_all(
  queryKeys: QueryKeys,
  searchKeys: SearchKeys,
  populatePath?: any,
  selectFields?: string | string[],
  modelSelect?: string,
) {
  return await Queries(
    service_model,
    queryKeys,
    searchKeys,
    populatePath,
    selectFields,
    modelSelect,
  );
}

export const service_service = Object.freeze({
  create,
  get_all,
  update,
  delete_service,
});
