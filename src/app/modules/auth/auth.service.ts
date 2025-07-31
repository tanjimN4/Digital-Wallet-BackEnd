import bcryptjs from "bcryptjs"
import httpStatus from "http-status-codes"
import { envVars } from "../../config/env"
import AppError from "../../errorHelpers/AppError"
import { generateToken } from "../../utils/jwt"
import { IUser } from "../user/user.interface"
import User from "../user/user.model"
const credentialsLogin=async(payload :Partial<IUser>)=>{
    const { email, password } = payload

    const isUserExist = await User.findOne({ email })

    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist")
    }
    const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string)
    if (!isPasswordMatched) {
        throw new AppError(httpStatus.BAD_REQUEST, "Incorrect password")
    }

    const jwtPayload = {
        userId: isUserExist._id,
        role: isUserExist.role,
        email: isUserExist.email
    }
    const accessToken =generateToken(jwtPayload,envVars.JWT_ACCESS_SECRET,envVars.JWT_ACCESS_EXPIRE)
    
    
    return {
        accessToken
    }
}


export const AuthService={
    credentialsLogin
}