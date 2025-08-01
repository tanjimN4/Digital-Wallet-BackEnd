/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express"
import httpStatus from "http-status-codes"
import { JwtPayload } from "jsonwebtoken"
import AppError from "../../errorHelpers/AppError"
import { catchAsync } from "../../utils/catchAsync"
import { deleteCookie } from "../../utils/deleteCookie"
import { sendResponse } from "../../utils/sendResponse"
import { setAuthCookie } from "../../utils/setCookie"
import { AuthService } from "./auth.service"
const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const logInfo = await AuthService.credentialsLogin(req.body)

    setAuthCookie(res, logInfo)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User logged in successfully",
        data: logInfo
    })
})

const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Refresh token not found')
    }
    const tokenInfo = await AuthService.getNewAccessToken(refreshToken)
    setAuthCookie(res, tokenInfo)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'New access token Retrieved successfully',
        data: tokenInfo,
    })
})
const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    deleteCookie(res,{
        accessToken: req.cookies.accessToken,
        refreshToken: req.cookies.refreshToken
    })
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Users Logout successfully',
        data: null,
    })
})
const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const newPassword = req.body.newPassword
    const oldPassword = req.body.oldPassword
    const decodeToken = req.user
    await AuthService.resetPassword(oldPassword, newPassword, decodeToken as JwtPayload)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Users Password Changed successfully',
        data: null,
    })
})

export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logout,
    resetPassword
}