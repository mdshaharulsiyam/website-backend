import state_model from "./state_model";
import { IState } from "./state_types";

async function create(data: Partial<IState>) {
  if (!data.name?.trim()) throw new Error("State name is required");

  const existing = await state_model.findOne({ name: data.name.trim() });
  if (existing) throw new Error("State with this name already exists");

  const result = await state_model.create({
    name: data.name.trim(),
  });

  return {
    success: true,
    message: "State created successfully",
    data: result,
  };
}

async function get_all() {
  const result = await state_model.find().select("-__v").sort({ name: 1 }).lean();
  return {
    success: true,
    message: "States retrieved successfully",
    data: result,
  };
}

async function update(id: string, data: Partial<IState>) {
  const updateData: Partial<IState> = {};

  if (data.name !== undefined) {
    if (!data.name.trim()) throw new Error("State name is required");
    updateData.name = data.name.trim();
  }

  const result = await state_model.findOneAndUpdate(
    { _id: id },
    { $set: updateData },
    { new: true },
  );

  if (!result) throw new Error("State not found");

  return {
    success: true,
    message: "State updated successfully",
    data: result,
  };
}

async function delete_state(id: string) {
  const result = await state_model.findOneAndDelete({ _id: id });

  if (!result) throw new Error("State not found");

  return {
    success: true,
    message: "State deleted successfully",
    data: result,
  };
}

export const state_service = Object.freeze({
  create,
  get_all,
  update,
  delete_state,
});
