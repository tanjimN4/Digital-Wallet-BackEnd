/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express"
import httpStatus from "http-status-codes"
import { JwtPayload } from "jsonwebtoken"
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
const withdrawMoney=catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const verifiedToken=req.user
    const { amount } = req.body

    const result = await TransactionServices.withdrawMoney({amount}, verifiedToken as JwtPayload)

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Money withdraw successfully",
        data: result
    })
})
const sendMoney=catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const verifiedToken=req.user

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
const getAllTransactions=catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const allTransactions = await TransactionServices.getAllTransactions()

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "All transactions",
        data: allTransactions
    })
})

export const TransactionController = {
    addMoney,
    withdrawMoney,
    sendMoney,
    getMyTransactionHistory,
    getAllTransactions
}