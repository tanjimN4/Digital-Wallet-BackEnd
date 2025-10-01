
import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { Transaction } from "../transaction/transaction.model";
import { walletStatus } from "../wallet/wallet.interface";
import Wallet from "../wallet/wallet.model";
import AppError from "./../../errorHelpers/AppError";
import { agentApprovalStatus, IAuthProvider, IsBlocked, IUser, Role } from "./user.interface";
import User from "./user.model";

const createUser = async (payload: Partial<IUser>) => {

    const { email, password, ...rest } = payload
    const session = await User.startSession()
    session.startTransaction()

    try {
        const isUserExist = await User.findOne({ email }).session(session)

        if (isUserExist) {
            throw new AppError(httpStatus.BAD_REQUEST, "User already exist")
        }
        const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND))

        const authProvider: IAuthProvider = {
            provider: "credentials",
            providerId: email as string
        }
        const createNewUser = await User.create([{
            auths: [authProvider],
            email,
            password: hashedPassword,
            ...rest
        }], {session})

         const newUser = createNewUser[0]
            const wallet = await Wallet.create(
            [{
                balance: 50,
                ownerId: newUser._id,
            }],
            { session }
        );
          newUser.walletId = wallet[0]._id;
        await newUser.save({ session });

        await session.commitTransaction()
        session.endSession()

        return {newUser,wallet}
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error
    }

}
const updateUsers = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {

    const isUserExist = await User.findOne({ _id: userId })

    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User not found")
    }
    if (payload.walletId || payload.email || payload.auths || payload.isBlocked || payload.agentApprovalStatus) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
    if (payload.role) {
        if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
        }

        if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
        }
    }
    if (decodedToken.role === Role.ADMIN) {
        if (isUserExist.role === Role.ADMIN && decodedToken.role === Role.ADMIN) {
            throw new AppError(httpStatus.FORBIDDEN, "admin can not change other admin role")
        }
    }

    if (decodedToken.role === Role.SUPER_ADMIN && decodedToken.userId === userId) {
        throw new AppError(httpStatus.FORBIDDEN, "Super admin role can not change there own role")
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

const blockUser = async (userId: string, decodedToken: JwtPayload) => {
     const session = await User.startSession();
    session.startTransaction();
    try {
        const isUserExist = await User.findOne({ _id: userId }).session(session)

        if (!isUserExist) {
            throw new AppError(httpStatus.BAD_REQUEST, "User not found")
        }
        if (isUserExist.isBlocked === IsBlocked.BLOCKED) {
            throw new AppError(httpStatus.BAD_REQUEST, 'User is not blocked')
        }
        if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
            throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized')
        }
        if (isUserExist.role === Role.ADMIN && decodedToken.role === Role.ADMIN || isUserExist.role === Role.SUPER_ADMIN && decodedToken.role === Role.SUPER_ADMIN) {
            throw new AppError(httpStatus.FORBIDDEN, `${isUserExist.role} can not block ${isUserExist.role}`)
        }
        const updateUser = await User.findOneAndUpdate({ _id: userId }, { isBlocked: IsBlocked.BLOCKED }, { new: true, runValidators: true,session })
        const updatedWallet = await Wallet.findOneAndUpdate({ ownerId: userId }, { status: walletStatus.BLOCKED }, { new: true, runValidators: true,session })
        await session.commitTransaction();
        session.endSession();
        return { updateUser, updatedWallet }
    } catch (error) {
         await session.abortTransaction();
        session.endSession()
        throw error
    }
}
const unBlockUser = async (userId: string, decodedToken: JwtPayload) => {
    const session = await User.startSession();
    session.startTransaction();
    try {
        const isUserExist = await User.findOne({ _id: userId }).session(session)

        if (!isUserExist) {
            throw new AppError(httpStatus.BAD_REQUEST, "User not found")
        }
        if (isUserExist.isBlocked === IsBlocked.ACTIVE) {
            console.log('kk',isUserExist.isBlocked);
            
            throw new AppError(httpStatus.BAD_REQUEST, 'User is not blocked')
        }
        if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
            throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized')
        }
        if (isUserExist.role === Role.ADMIN && decodedToken.role === Role.ADMIN || isUserExist.role === Role.SUPER_ADMIN && decodedToken.role === Role.SUPER_ADMIN) {
            throw new AppError(httpStatus.FORBIDDEN, `${isUserExist.role} can not block ${isUserExist.role}`)
        }
        const updateUser = await User.findOneAndUpdate({ _id: userId }, { isBlocked: IsBlocked.ACTIVE }, { new: true, runValidators: true ,session})
        const updatedWallet = await Wallet.findOneAndUpdate({ ownerId: userId }, { status: walletStatus.ACTIVE }, { new: true, runValidators: true,session })
        await session.commitTransaction();
        session.endSession()
        return { updateUser, updatedWallet }
        
    } catch (error) {
        await session.abortTransaction();
        session.endSession()
        throw error
    }
}

const getAllUsers = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(User.find(), query);

    const usersQuery = queryBuilder
        .filter()
        .sort()
        .fields()
        .paginate();

    const [users, meta] = await Promise.all([
        usersQuery.build(),
        queryBuilder.getMeta()
    ]);

    // Get all walletIds from users
    const walletIds = users.map(user => user.walletId);
    const wallets = await Wallet.find({ _id: { $in: walletIds } }).lean();

    // Get all transactions for these wallets
    const transactions = await Transaction.find({
        $or: [
            { fromWallet: { $in: walletIds } },
            { toWallet: { $in: walletIds } }
        ]
    }).lean();

    // Merge users with wallets + transactions
    const usersWithWalletAndTransactions = users.map(user => {
        const userObj = user.toObject ? user.toObject() : user;
        const wallet = wallets.find(w => w._id.toString() === user.walletId?.toString());

        const userTransactions = transactions.filter(
            t =>
                t.fromWallet?.toString() === user.walletId?.toString() ||
                t.toWallet?.toString() === user.walletId?.toString()
        );

        return {
            ...userObj,
            wallet,
            transactions: userTransactions
        };
    });

    return {
        data: usersWithWalletAndTransactions,
        meta
    };
};
const getEmailRoleUsers = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(User.find(), query);

    const usersQuery = queryBuilder
        .filter()
        .sort()
        .fields()
        .paginate();

    const [users, meta] = await Promise.all([
        usersQuery.build(),
        queryBuilder.getMeta()
    ]);

    // Only pick email and role
    const simplifiedUsers = users.map(user => {
        const userObj = user.toObject ? user.toObject() : user;
        return {
            email: userObj.email,
            role: userObj.role,
            agentApprovalStatus:userObj.agentApprovalStatus
        };
    });

    return {
        data: simplifiedUsers,
        meta
    };
};

const getMe = async (userId: string) => {
  const user = await User.findById(userId)
    .select("-password")
    .lean();

  if (!user) {
    return {
      success: false,
      message: "User not found",
      data: null,
    };
  }

  // fetch wallet using walletId
  const wallet = user.walletId
    ? await Wallet.findById(user.walletId).lean()
    : null;

  // Destructure user to remove walletId if you don’t want it in response
  const { walletId, ...restUser } = user;

  return {
    success: true,
    message: "Your profile Retrieved Successfully",
    data: {
      ...restUser,
      wallet,
    },
  };
};



export const UserServices = {
    createUser,
    getAllUsers,
    updateUsers,
    blockUser,
    unBlockUser,
    getMe,getEmailRoleUsers
}