/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express"
import httpStatus from "http-status-codes"
import { JwtPayload } from "jsonwebtoken"
import passport from "passport"
import { envVars } from "../../config/env"
import AppError from "../../errorHelpers/AppError"
import { catchAsync } from "../../utils/catchAsync"
import { deleteCookie } from "../../utils/deleteCookie"
import { sendResponse } from "../../utils/sendResponse"
import { setAuthCookie } from "../../utils/setCookie"
import { createUserToken } from "../../utils/userTokens"
import { IUser } from "../user/user.interface"
import User from "../user/user.model"
import Wallet from "../wallet/wallet.model"
import { AuthService } from "./auth.service"
const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', async (err: any, user: any, info: any) => {

        if (err) {
            return next(new AppError(httpStatus.BAD_REQUEST, err.message))
        }
        if (!user) {
            return next(new AppError(httpStatus.BAD_REQUEST, info.message))
        }

        const userTokens = createUserToken(user)
        const { password, ...rest } = user.toObject()
        setAuthCookie(res, userTokens)

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Users Login successfully',
            data: {
                accessToken: userTokens.accessToken,
                refreshToken: userTokens.refreshToken,
                user: rest
            },
        })
    })(req, res, next);
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
    deleteCookie(res, {
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
const googleCallBackController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    let redirectTo = req.query.state ? req.query.state as string : ""
    if (redirectTo.startsWith("/")) {
        redirectTo = redirectTo.slice(1)
    }
    const user = req.user as IUser
    console.log(user);


    if (!user) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User not found')
    }
    const session = await User.startSession();
    session.startTransaction();
    try {
        if (user) {
            const isWalletExist = await Wallet.findOne({ ownerId: user._id }).session(session);
            if (!isWalletExist) {
                const wallet = await Wallet.create(
                    [{ balance: 50, ownerId: user._id }],
                    { session }
                )
                user.walletId = wallet[0]._id
                await User.findByIdAndUpdate(user._id, { walletId: wallet[0]._id }, { session });
            }
        }

        const tokenInfo = createUserToken(user)

        setAuthCookie(res, tokenInfo)
        res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`)
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }

})


export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logout,
    resetPassword,
    googleCallBackController
}