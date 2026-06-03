import { optional, z } from "zod";

const create_validate = z.object({
    user: z
        .string({
            required_error: "User ID is required",
            invalid_type_error: "User ID must be a string",
        })
        .min(1, "User ID cannot be empty"),

    name: z
        .string({
            required_error: "Business name is required",
            invalid_type_error: "Business name must be a string",
        })
        .min(1, "Business name cannot be empty"),

    logo: z
        .string({
            invalid_type_error: "Logo must be a string or null",
        }).max(1, "cannot upload more then 1 logo")
        .optional(),

    banner: z
        .string({
            invalid_type_error: "Banner must be a string",
        })
        .max(1, "cannot upload more then 1 logo"),

    address: z
        .string({
            required_error: "Address is required",
            invalid_type_error: "Address must be a string",
        })
        .min(1, "Address cannot be empty"),

    location: z.object({
        type: z.literal("Point", {
            errorMap: () => ({ message: "Location type must be 'Point'" }),
        }).optional(),
        coordinates: z
            .tuple([
                z.number({
                    required_error: "Longitude is required",
                    invalid_type_error: "Longitude must be a number",
                }),
                z.number({
                    required_error: "Latitude is required",
                    invalid_type_error: "Latitude must be a number",
                }),
            ]),
    }).optional(),

    trade_license: z
        .string({
            invalid_type_error: "Trade license must be a string or null",
        })
        .nullable()
        .optional(),

    business_category: z.enum(
        [
            "salon",
            "restaurant",
            "medical",
            "fitness",
            "shop",
            "real_estate",
            "services",
            "other",
        ],
        {
            required_error: "Business category is required",
            invalid_type_error: "Invalid business category",
        }
    ),

    business_sub_admins: z
        .array(z.string({
            invalid_type_error: "Each sub-admin ID must be a string",
        })).optional(),
    // .nonempty("Business sub-admins cannot be empty"),

    business_documents: z
        .array(z.string({
            invalid_type_error: "Each document path must be a string",
        })).optional()
    // .nonempty("Business documents cannot be empty"),
});

const update_validate = z.object({
    user: z
        .string({
            required_error: "User ID is required",
            invalid_type_error: "User ID must be a string",
        })
        .min(1, "User ID cannot be empty").optional(),

    name: z
        .string({
            required_error: "Business name is required",
            invalid_type_error: "Business name must be a string",
        })
        .min(1, "Business name cannot be empty").optional(),

    logo: z
        .string({
            invalid_type_error: "Logo must be a string or null",
        }).max(1, "cannot upload more then 1 logo")
        .optional(),

    banner: z
        .string({
            invalid_type_error: "Banner must be a string",
        })
        .max(1, "cannot upload more then 1 logo").optional(),

    address: z
        .string({
            required_error: "Address is required",
            invalid_type_error: "Address must be a string",
        })
        .min(1, "Address cannot be empty").optional(),

    location: z.object({
        type: z.literal("Point", {
            errorMap: () => ({ message: "Location type must be 'Point'" }),
        }).optional(),
        coordinates: z
            .tuple([
                z.number({
                    required_error: "Longitude is required",
                    invalid_type_error: "Longitude must be a number",
                }),
                z.number({
                    required_error: "Latitude is required",
                    invalid_type_error: "Latitude must be a number",
                }),
            ]),
    }).optional(),

    trade_license: z
        .string({
            invalid_type_error: "Trade license must be a string or null",
        })
        .nullable()
        .optional(),

    business_category: z.enum(
        [
            "salon",
            "restaurant",
            "medical",
            "fitness",
            "shop",
            "real_estate",
            "services",
            "other",
        ],
        {
            required_error: "Business category is required",
            invalid_type_error: "Invalid business category",
        }
    ),

    business_sub_admins: z
        .array(z.string({
            invalid_type_error: "Each sub-admin ID must be a string",
        })).optional(),
    // .nonempty("Business sub-admins cannot be empty"),

    business_documents: z
        .array(z.string({
            invalid_type_error: "Each document path must be a string",
        })).optional()
    // .nonempty("Business documents cannot be empty"),
});

export const business_validate = Object.freeze({
    create_validate,
    update_validate
});
