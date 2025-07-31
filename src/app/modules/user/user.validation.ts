import z from "zod";

export const createUserZodSchema = z.object({
  name: z
    .string({ invalid_type_error: "Name must be a string" })
    .min(3, { message: "Name must be at least 3 characters long" }),
  email: z
    .string({ invalid_type_error: "Email must be a string" })
    .email({ message: "Invalid email address" }),
  password: z
    .string({ invalid_type_error: "Password must be a string" })
    .min(6, { message: "Password must be at least 6 characters long" }),
  phone: z
    .string({ invalid_type_error: "Phone must be a string" })
    .optional(),
});
