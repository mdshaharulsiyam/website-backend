import division_model from "./division_model";
import { IDivision } from "./division_types";

async function create(data: Partial<IDivision>) {
  if (!data.name?.trim()) throw new Error("Division name is required");

  const existing = await division_model.findOne({ name: data.name.trim() });
  if (existing) throw new Error("Division with this name already exists");

  const result = await division_model.create({
    name: data.name.trim(),
  });

  return {
    success: true,
    message: "Division created successfully",
    data: result,
  };
}

async function get_all() {
  const result = await division_model.find().select("-__v").sort({ name: 1 }).lean();
  return {
    success: true,
    message: "Divisions retrieved successfully",
    data: result,
  };
}

async function update(id: string, data: Partial<IDivision>) {
  if (data.name !== undefined) {
    if (!data.name.trim()) throw new Error("Division name is required");
  }

  const result = await division_model.findOneAndUpdate(
    { _id: id },
    { $set: { name: data.name?.trim() } },
    { new: true },
  );

  if (!result) throw new Error("Division not found");

  return {
    success: true,
    message: "Division updated successfully",
    data: result,
  };
}

async function delete_division(id: string) {
  const result = await division_model.findOneAndDelete({ _id: id });

  if (!result) throw new Error("Division not found");

  return {
    success: true,
    message: "Division deleted successfully",
    data: result,
  };
}

export const division_service = Object.freeze({
  create,
  get_all,
  update,
  delete_division,
});
