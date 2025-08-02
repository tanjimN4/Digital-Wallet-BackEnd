/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express"
import httpStatus from "http-status-codes"
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"
import { WalletServices } from "./wallet.services"
const getAllWallet = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query
    const result = await WalletServices.getAllWallet(query as Record<string, string>)
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Users fetched successfully",
         data: result.data,
        meta: result.meta,
    })
})


export const WalletControllers = {
    getAllWallet
}