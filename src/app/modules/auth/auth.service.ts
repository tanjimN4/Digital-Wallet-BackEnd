/* eslint-disable @typescript-eslint/no-non-null-assertion */
import bcryptjs from "bcryptjs"
import httpStatus from "http-status-codes"
import { JwtPayload } from "jsonwebtoken"
import { envVars } from "../../config/env"
import AppError from "../../errorHelpers/AppError"
import { cerateNewAccessTokenWithRefreshToken } from "../../utils/userTokens"
import User from "../user/user.model"

const getNewAccessToken = async (refreshToken: string) => {
    const newAccessToken = await cerateNewAccessTokenWithRefreshToken(refreshToken)

    return {
        accessToken: newAccessToken
    }

}
const resetPassword = async(oldPassword : string,newPassword : string,decodeToken : JwtPayload)=>{

    const user = await User.findById(decodeToken.userId)

    const isOldPasswordMatched = await bcryptjs.compare(oldPassword,user!.password as string)
    if(!isOldPasswordMatched){
        throw new AppError(httpStatus.BAD_REQUEST,'Old password does not match')
    }

    user!.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND))

    user!.save()
}


export const AuthService = {
    getNewAccessToken,
    resetPassword
}