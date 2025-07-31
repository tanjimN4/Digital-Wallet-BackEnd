/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserServices } from "./user.services";
const createUser=catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    const user =await UserServices.createUser(req.body)

    sendResponse(res, {
        statusCode:httpStatus.CREATED,
        success:true,
        message:"User created successfully",
        data:user
    })
})

const getAllUsers=catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    const users =await UserServices.getAllUsers()
      sendResponse(res, {
        statusCode:httpStatus.CREATED,
        success:true,
        message:"User created successfully",
        data:users
    })
})

export const UserControllers={
    createUser,
    getAllUsers
}