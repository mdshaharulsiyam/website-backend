import { z } from "zod";

const create_validation = z.object({
  body: z.object({
    email: z.string({
      required_error: "email is required z",
    }),
    password: z.string({ required_error: "Password is required" }),
  }),
});
export const upazilas_validate = Object.freeze({
  create_validation,
});
