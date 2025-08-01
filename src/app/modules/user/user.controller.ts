/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserServices } from "./user.services";
const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body)

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User created successfully",
        data: user
    })
})
const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id
     const verifiedToken=req.user
    const user = await UserServices.updateUsers(userId, req.body, verifiedToken as JwtPayload)

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User updated successfully",
        data: user
    })
})

const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.getAllUsers()
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Users fetched successfully",
        data: result
    })
})

export const UserControllers = {
    createUser,
    getAllUsers,
    updateUser
}