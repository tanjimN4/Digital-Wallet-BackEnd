import { z } from "zod";

const amountSchema = z.number({
  required_error: "Amount is required",
  invalid_type_error: "Amount must be a number"
}).positive("Amount must be greater than 0");
const balanceSchema = z.number({
  required_error: "Amount is required",
  invalid_type_error: "Amount must be a number"
}).positive("Amount must be greater than 0");

export const addMoneyZodSchema = z.object({
    amount: amountSchema
});

export const withdrawMoneyZodSchema = z.object({
  email: z.string({invalid_type_error:"Email must be a string"}).email({message:"Invalid email address"}),
    amount: amountSchema
});

export const sendMoneyZodSchema = z.object({
    balance: balanceSchema,
    email : z.string({invalid_type_error:"Email must be a string"}).email({message:"Invalid email address"}),
});
