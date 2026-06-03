import { z } from "zod";

const objectId = z
  .string({
    required_error: "category is required",
    invalid_type_error: "category should be string",
  })
  .regex(/^[0-9a-fA-F]{24}$/, "invalid category id");

const image_validate = z
  .array(
    z.string({
      required_error: "Each image must be a string",
      invalid_type_error: "img should be string url",
    }),
  )
  .min(1, "image is required")
  .max(1, "maximum 1 image can be uploaded");

const is_active_validate = z.preprocess(
  (value) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  },
  z.boolean({
    required_error: "is_active is required",
    invalid_type_error: "is_active should be boolean",
  }),
);

const create_validate = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "service name is required",
        invalid_type_error: "name should be string",
      })
      .refine((value) => value.trim().length > 0, "service name is required"),
    img: image_validate,
    category: objectId,
    is_active: is_active_validate.optional(),
  }),
  cookies: z.string({ required_error: "authentication token are missing" }),
});

const update_validate = z.object({
  body: z
    .object({
      name: z
        .string({
          required_error: "service name is required",
          invalid_type_error: "name should be string",
        })
        .refine((value) => value.trim().length > 0, "service name is required")
        .optional(),
      img: image_validate.optional(),
      category: objectId.optional(),
      is_active: is_active_validate.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "at least one field is required",
    }),
  cookies: z.string({ required_error: "authentication token are missing" }),
});

export const service_validate = Object.freeze({
  create_validate,
  update_validate,
});
