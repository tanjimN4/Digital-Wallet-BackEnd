/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express"
import httpStatus from "http-status-codes"
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"
import { AuthService } from "./auth.service"
const credentialsLogin=catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
 const loginfo=await AuthService.credentialsLogin(req.body)
 
 sendResponse(res, {
    statusCode:httpStatus.OK,
    success:true,
    message:"User logged in successfully",
    data:loginfo
})
})

export const AuthControllers={
    credentialsLogin
}