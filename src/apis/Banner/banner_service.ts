import { UnlinkFiles } from "../../middleware/fileUploader";
import Aggregator from '../../utils/Aggregator';
import { QueryKeys, SearchKeys } from "../../utils/Queries";
import { banner_model } from "./banner_model";
import { IBanner } from "./banner_type";

const create = async (data: Partial<IBanner>) => {
  const result = await banner_model.create(data);
  return {
    success: true,
    message: "banner created successfully",
    data: result,
  };
};

const update = async (id: string, data: Partial<IBanner>) => {
  const existing_banner = await banner_model.findById(id);

  if (!existing_banner) throw new Error("Banner not found");

  if (data?.img) UnlinkFiles([existing_banner?.img]);

  const result = await banner_model.findByIdAndUpdate(
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
    message: "banner updated successfully",
    data: result,
  };
};

const delete_banner = async (id: string) => {
  const existing_banner = await banner_model.findById(id);

  if (!existing_banner) throw new Error("Banner not found");

  if (existing_banner?.img) UnlinkFiles([existing_banner?.img]);

  const result = await banner_model.findByIdAndDelete(id);

  return {
    success: true,
    message: "banner deleted successfully",
    data: result,
  };
};

const get_all = async (queryKeys: QueryKeys, searchKeys: SearchKeys) => {
  return await Aggregator(banner_model, queryKeys, searchKeys, [
    {
      $project: {
        "_id": 1,
        "img": 1,
        "link": 1,
        "is_active": 1,
        "offer": 1,
        "heading": 1,
        "description": 1,
        "button": 1,
        "start_date": 1,
        "end_date": 1,
        "createdAt": 1,
        "updatedAt": 1,
      }
    }
  ]);
};

export const banner_service = Object.freeze({
  create,
  update,
  delete_banner,
  get_all,
});
