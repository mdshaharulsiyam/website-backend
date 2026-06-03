import { z } from "zod";

const create_validate = z.object({
    body: z.object({
        name: z.string({ required_error: "coupon name is required", invalid_type_error: "coupon name should be string" }),
        percentage: z.number({ required_error: "parentage is required", invalid_type_error: "percentage should be a number" }).min(1, "").max(100),
        total_available: z.number().min(0),
    }),
    cookies: z.string({})
})