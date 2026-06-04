import { z } from "zod";

const login_validation = z.object({
  body: z.object({
    email: z.string({ required_error: "email is required", invalid_type_error: "invalid type for email" }).regex(
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
      "Invalid email format",
    ),
    password: z.string({ required_error: "Password is required", invalid_type_error: "password should be string" }),
  }),
});

const sign_up_validation = z.object({
  body: z.object({
    email: z
      .string({ required_error: "email is required", invalid_type_error: "invalid type for email" })
      .trim()
      .toLowerCase()
      .regex(
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
        "Invalid email format",
      ),
    password: z
      .string({ required_error: "Password is required", invalid_type_error: "password should be string" })
      .min(8, "password should be more then 8 character"),
    // .regex(
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
    //   "Password must include uppercase, lowercase, number, and special character",
    // ),
    confirm_password: z.string({
      required_error: "confirm Password is required",
      invalid_type_error: "confirm password should be string"
    }),
    phone: z.string({ required_error: "phone is required", invalid_type_error: "phone number should be a string" }),
    name: z.string({ required_error: "name is required", invalid_type_error: "name should be a string" }),
  }),
});

const reset_password_validate = z.object({
  body: z.object({
    password: z
      .string({ required_error: "password is required", invalid_type_error: "password should be string" })
      .min(8, "password should be more then 8 character")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
        "Password must include uppercase, lowercase, number, and special character",
      ),
    confirm_password: z.string({
      required_error: "confirm password is required",
      invalid_type_error: "confirm password should be string"
    }),
  }),
});

const change_password_validate = z.object({
  body: z.object({
    password: z
      .string({ required_error: "password is required", invalid_type_error: "password should be string" })
      .min(8, "password should be more then 8 character")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
        "Password must include uppercase, lowercase, number, and special character",
      ),
    confirm_password: z.string({
      required_error: "confirm password is required",
      invalid_type_error: "confirm password should be string"
    }),
  }),
});

const update_auth_validation = z.object({
  body: z.object({
    email: z
      .string({ required_error: "email is required" })
      .trim()
      .toLowerCase()
      .regex(
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
        "Invalid email format",
      ).optional(),
    phone: z.string({ required_error: "phone is required" }).optional(),
    name: z.string({ required_error: "name is required" }).optional(),
    img: z.array(z.string()).max(1, "maximum 1 image can be upload").optional(),
    documents: z
      .array(z.string())
      .max(2, "maximum 1 image can be upload")
      .optional(),
  }),
});

const create_admin_validation = z.object({
  body: z.object({
    email: z
      .string({ required_error: "email is required" })
      .trim()
      .toLowerCase()
      .regex(
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
        "Invalid email format",
      ),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "password should be more then 8 character")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
        "Password must include uppercase, lowercase, number, and special character",
      ),
    confirm_password: z.string({
      required_error: "confirm Password is required"
    }),
    name: z.string({ required_error: "name is required" }),
  }),
});

const change_role_validation = z.object({
  body: z.object({
    role: z.enum(["USER", "ADMIN", "SUPER_ADMIN", "VENDOR", "RIDER", "PROFESSIONAL"], {
      required_error: "Role is required",
      invalid_type_error: "Invalid role",
    }),
  }),
});

export const auth_validate = Object.freeze({
  login_validation,
  sign_up_validation,
  reset_password_validate,
  change_password_validate,
  update_auth_validation,
  create_admin_validation,
  change_role_validation,
});
