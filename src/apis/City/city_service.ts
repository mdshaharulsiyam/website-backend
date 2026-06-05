import city_model from "./city_model";
import { ICity } from "./city_types";

async function create(data: Partial<ICity>) {
  if (!data.name?.trim()) throw new Error("City name is required");
  if (!data.state) throw new Error("State id is required");

  const existing = await city_model.findOne({ name: data.name.trim() });
  if (existing) throw new Error("City with this name already exists");

  const result = await city_model.create({
    name: data.name.trim(),
    state: data.state,
  });

  return {
    success: true,
    message: "City created successfully",
    data: result,
  };
}

async function get_all() {
  const result = await city_model.find().populate("state").select("-__v").sort({ name: 1 }).lean();
  return {
    success: true,
    message: "Cities retrieved successfully",
    data: result,
  };
}

async function update(id: string, data: Partial<ICity>) {
  const updateData: Partial<ICity> = {};

  if (data.name !== undefined) {
    if (!data.name.trim()) throw new Error("City name is required");
    updateData.name = data.name.trim();
  }

  if (data.state !== undefined) {
    if (!data.state) throw new Error("State id is required");
    updateData.state = data.state;
  }

  const result = await city_model.findOneAndUpdate(
    { _id: id },
    { $set: updateData },
    { new: true },
  );

  if (!result) throw new Error("City not found");

  return {
    success: true,
    message: "City updated successfully",
    data: result,
  };
}

async function delete_city(id: string) {
  const result = await city_model.findOneAndDelete({ _id: id });

  if (!result) throw new Error("City not found");

  return {
    success: true,
    message: "City deleted successfully",
    data: result,
  };
}

export const city_service = Object.freeze({
  create,
  get_all,
  update,
  delete_city,
});
