import faq_model from "./faq_model";
import { IFaq } from "./faq_types";

async function create(data: Partial<IFaq>) {
  if (!data.question?.trim()) throw new Error("question is required");
  if (!data.answer?.trim()) throw new Error("answer is required");

  const result = await faq_model.create({
    question: data.question.trim(),
    answer: data.answer.trim(),
    category: data.category?.trim() || "General",
  });

  return {
    success: true,
    message: "faq created successfully",
    data: result,
  };
}

async function get_all() {
  const result = await faq_model.find().select("-__v").sort({ createdAt: -1 }).lean();
  return {
    success: true,
    message: "faq retrieve successfully",
    data: result,
  };
}

async function update(id: string, data: Partial<IFaq>) {
  const updateData: Partial<IFaq> = {};

  if (data.question !== undefined) {
    if (!data.question.trim()) throw new Error("question is required");
    updateData.question = data.question.trim();
  }

  if (data.answer !== undefined) {
    if (!data.answer.trim()) throw new Error("answer is required");
    updateData.answer = data.answer.trim();
  }

  if (data.category !== undefined) {
    updateData.category = data.category.trim() || "General";
  }

  const result = await faq_model.findOneAndUpdate(
    { _id: id },
    { $set: updateData },
    { new: true },
  );

  if (!result) throw new Error("faq not found");

  return {
    success: true,
    message: "faq updated successfully",
    data: result,
  };
}

async function delete_faq(id: string) {
  const result = await faq_model.findOneAndDelete({ _id: id });

  if (!result) throw new Error("faq not found");

  return {
    success: true,
    message: "faq deleted successfully",
    data: result,
  };
}

export const faq_service = Object.freeze({
  create,
  get_all,
  update,
  delete_faq,
});
