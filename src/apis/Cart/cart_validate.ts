import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");


export const create_validate = z.object({
  body: z.object({
    product_id: objectId,
    quantity: z.number().min(1, "Quantity must be at least 1"),
    color: z.string().optional(),
    size: z.string().optional(),
  }),
  cookies: z.string({ required_error: "authentication token are missing" }),
});
export const cart_validate = Object.freeze({
  create_validate
})