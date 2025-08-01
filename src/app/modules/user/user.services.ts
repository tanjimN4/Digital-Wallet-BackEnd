import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import Wallet from "../wallet/wallet.model";
import AppError from "./../../errorHelpers/AppError";
import { IAuthProvider, IsBlocked, IUser, Role } from "./user.interface";
import User from "./user.model";

const createUser = async (payload: Partial<IUser>) => {
    const { email, password, ...rest } = payload

    const isUserExist = await User.findOne({ email })

    if (isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User already exist")
    }
    const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND))

    const authProvider: IAuthProvider = {
        provider: "credentials",
        providerId: email as string
    }
    const createNewUser = await User.create({
        auths: [authProvider],
        email,
        password: hashedPassword,
        ...rest
    })

    const wallet = await Wallet.create({
        balance: 50,
        ownerId: createNewUser._id,
    })

    createNewUser.walletId = wallet._id
    await createNewUser.save()
    return createNewUser
}
const updateUsers = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {

    const isUserExist = await User.findOne({ _id: userId })

    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User not found")
    }
    if (payload.walletId || payload.email || payload.auths) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
    if ('agentApprovalStatus' in payload) {
        if (decodedToken.role !== Role.ADMIN && decodedToken.role !== Role.SUPER_ADMIN) {
            throw new AppError(httpStatus.FORBIDDEN, "Only ADMIN or SUPER_ADMIN can update agent approval status");
        }
    }

    if (payload.role) {
        if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
        }

        if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
        }
    }
    
    if (payload.isBlocked === IsBlocked.BLOCKED) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
    if (payload.password) {
        payload.password = await bcryptjs.hash(payload.password, envVars.BCRYPT_SALT_ROUND)
    }
    const updatedUser = await User.findOneAndUpdate({ _id: userId }, payload, { new: true, runValidators: true })
    return updatedUser

}



const getAllUsers = async () => {
    const users = await User.find()
    return users
}

export const UserServices = {
    createUser,
    getAllUsers,
    updateUsers
}