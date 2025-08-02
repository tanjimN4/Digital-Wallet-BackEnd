import z from "zod";
import { IsBlocked, Role } from "./user.interface";

export const createUserZodSchema = z.object({
  name: z
    .string({ invalid_type_error: "Name must be a string" })
    .min(3, { message: "Name must be at least 3 characters long" }),
  email: z
    .string({ invalid_type_error: "Email must be a string" })
    .email({ message: "Invalid email address" }),
  password: z
    .string({ invalid_type_error: "Password must be a string" })
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/\d/, { message: "Password must contain at least one number" })
    .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, {
      message: "Password must contain at least one special character"
    }),
  phone: z
    .string({ invalid_type_error: "Phone must be a string" })
    .optional(),
});

export const updateUserZodSchema = z.object({
  name: z
    .string({ invalid_type_error: 'Name must be a string' })
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(50, { message: 'Name must be at most 50 characters long' })
    .optional(),
  password: z
    .string({ invalid_type_error: "Password must be a string" })
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/\d/, { message: "Password must contain at least one number" })
    .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, {
      message: "Password must contain at least one special character"
    })
    .optional(),
  phone: z
    .string({ invalid_type_error: 'Phone must be a string' })
    .regex(/^(?:\+8801|8801|01)[3-9]\d{8}$/, {
      message: 'Phone number must be a valid Bangladeshi number',
    })
    .optional(),
  role: z
    .enum(Object.keys(Role) as [string])
    .optional(),
  IsBlocked: z
    .enum(Object.values(IsBlocked) as [string])
    .optional(),

})

export const blockUserZodSchema = z.object({
  isBlocked: z
    .enum(Object.values(IsBlocked) as [string])
})
export const unBlockUserZodSchema = z.object({
  isBlocked: z
    .enum(Object.values(IsBlocked) as [string])
})
