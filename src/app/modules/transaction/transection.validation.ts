import { z } from "zod";

const amountSchema = z.number({
  required_error: "Amount is required",
  invalid_type_error: "Amount must be a number"
}).positive("Amount must be greater than 0");

export const addMoneyZodSchema = z.object({
    amount: amountSchema
});

export const withdrawMoneyZodSchema = z.object({
    amount: amountSchema
});

export const sendMoneyZodSchema = z.object({
    amount: amountSchema,
    ownerId: z.string({ required_error: "Receiver Id is required" }),
});
