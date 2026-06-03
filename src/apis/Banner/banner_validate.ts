import { z } from "zod";

const form_boolean = z.preprocess((value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean().optional());

const form_date = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) return undefined;
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") return new Date(value);
  return value;
}, z.date().optional());

const create_validate = z.object({
  body: z.object({
    img: z
      .array(
        z.string({
          invalid_type_error: "banner image should be a link string",
        }),
      )
      .min(1, "banner image is required")
      .max(1, "maximum 1 image can be uploaded at a time")
      .optional(),
    link: z.string({ required_error: "link is required", invalid_type_error: "link should be string" }).optional(),
    is_active: form_boolean,
    offer: z
      .string({ required_error: "offer is required", invalid_type_error: "offer text should be string" }),
    heading: z
      .string({ required_error: "heading is required", invalid_type_error: "heading should be string" }),
    description: z
      .string({ required_error: "description is required", invalid_type_error: "description should be string" }),
    button: z
      .string({ required_error: "button is required", invalid_type_error: "button should be string" }),
    start_date: form_date,
    end_date: form_date,
  }),
  cookies: z.string({ required_error: "authentication token are missing" }),
});

const update_validate = z.object({
  body: z.object({
    img: z
      .array(
        z.string({
          invalid_type_error: "banner image should be a link string",
        }),
      )
      .min(1, "banner image is required")
      .max(1, "maximum 1 image can be uploaded at a time")
      .optional(),
    link: z.string({ required_error: "link is required", invalid_type_error: "link should be string" }).optional(),
    is_active: form_boolean,
    offer: z
      .string({ required_error: "offer is required", invalid_type_error: "offer text should be string" }),
    heading: z
      .string({ required_error: "heading is required", invalid_type_error: "heading should be string" }),
    description: z
      .string({ required_error: "description is required", invalid_type_error: "description should be string" }),
    button: z
      .string({ required_error: "button is required", invalid_type_error: "button should be string" }),
    start_date: form_date,
    end_date: form_date,
  }),
  cookies: z.string({ required_error: "authentication token are missing" }),
});

export const banner_validate = Object.freeze({
  create_validate,
  update_validate,
});
