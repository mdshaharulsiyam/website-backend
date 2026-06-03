import { z } from "zod";

const create_validate = z.object({
  body: z.object({
    name: z.string({ required_error: "category name is required", invalid_type_error: "name should be string" }),
    img: z
      .array(z.string({ required_error: "Each image must be a string", invalid_type_error: "img should be string url" }))
      .min(1, "image is required").max(1, "maximum 1 image can be upload"),
  }),
  cookies: z.string({ required_error: "authentication token i missing" }),
});


const update_validate = z.object({
  body: z.object({
    name: z.string({ required_error: "category name is required", invalid_type_error: "name should be string" }).optional(),
    img: z
      .array(z.string({ required_error: "Each image must be a string", invalid_type_error: "img should be string url" }))
      .min(1, "image is required").max(1, "maximum 1 image can be upload"),
  }).optional(),
  cookies: z.string({ required_error: "authentication token i missing" }),
});


export const category_validate = Object.freeze({
  create_validate,
  update_validate
});
