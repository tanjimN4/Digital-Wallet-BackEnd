/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express"
import httpStatus from "http-status-codes"
import { JwtPayload } from "jsonwebtoken"
import AppError from "../../errorHelpers/AppError"
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"
import { TransactionServices } from "./transaction.services"

const addMoney=catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const verifiedToken=req.user
    const { amount } = req.body

    const result = await TransactionServices.addMoney({amount}, verifiedToken as JwtPayload)

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Money added successfully",
        data: result
    })

})
export const withdrawMoney = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, amount } = req.body; // email of agent
    const verifiedToken=req.user
    if (!email || !amount) {
      return next(new AppError(httpStatus.BAD_REQUEST, "Email and amount are required"));
    }

    const result = await TransactionServices.withdrawMoney({ email, amount },verifiedToken as JwtPayload);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Money withdrawn successfully",
      data: result,
    });
  }
);
const sendMoney=catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const verifiedToken=req.user

    console.log(res,req.body);

    const result = await TransactionServices.sendMoney(req.body, verifiedToken as JwtPayload)

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Money send successfully",
        data: result
    })
})
const getMyTransactionHistory=catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const verifiedToken=req.user

    const result = await TransactionServices.getMyTransactionHistory(verifiedToken as JwtPayload)

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "My transaction history",
        data: result
    })
})
//admin/super admin
const getAllTransactions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await TransactionServices.getAllTransactions(
      query as Record<string, string>
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All transactions fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

export const TransactionController = {
    addMoney,
    withdrawMoney,
    sendMoney,
    getMyTransactionHistory,
    getAllTransactions
}