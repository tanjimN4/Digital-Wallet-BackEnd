import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { envVars } from "../../config/env";
import Wallet from "../wallet/wallet.model";
import ApiError from "./../../errorHelpers/AppError";
import { IAuthProvider, IUser } from "./user.interface";
import User from "./user.model";

const createUser = async (payload: Partial<IUser>) => {
    const { email, password, ...rest } = payload

    const isUserExist = await User.findOne({ email })

    if (isUserExist) {
        throw new ApiError(httpStatus.BAD_REQUEST, "User already exist")
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
    console.log("New User:", createNewUser);
    console.log("User ID:", createNewUser._id);

    const wallet = await Wallet.create({
        balance: 50,
        ownerId: createNewUser._id,
    })

    createNewUser.walletId = wallet._id
    await createNewUser.save()
    return createNewUser
}

export const UserServices = {
    createUser,
}