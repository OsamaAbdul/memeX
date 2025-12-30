import { z } from "zod";

export const createTokenSchema = z.object({
    name: z
        .string()
        .min(3, { message: "Token name must be at least 3 characters." })
        .max(30, { message: "Token name must not exceed 30 characters." }),
    ticker: z
        .string()
        .min(3, { message: "Ticker must be at least 3 characters." })
        .max(10, { message: "Ticker must not exceed 10 characters." })
        .regex(/^[A-Z0-9]+$/, { message: "Ticker must be alphanumeric and uppercase." }),
    description: z
        .string()
        .max(500, { message: "Description must not exceed 500 characters." })
        .optional(),
    image: z
        .any()
        .refine((files) => files?.length > 0, "Image is required.")
        .refine((files) => files?.[0]?.size <= 5000000, `Max image size is 5MB.`)
        .refine(
            (files) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(files?.[0]?.type),
            "Only .jpg, .png, .webp and .gif formats are supported."
        ),
});

export type CreateTokenValues = z.infer<typeof createTokenSchema>;
