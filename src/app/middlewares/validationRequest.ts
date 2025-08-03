import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

export const validationRequest = (zodSchema:AnyZodObject) => async (req:Request, res:Response, next:NextFunction) => {
    try {
        await zodSchema.parseAsync(req.body);
        next();
    } catch (error) {
        next(error);
    }
}