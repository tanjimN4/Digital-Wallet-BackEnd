/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes"
import { JwtPayload } from "jsonwebtoken"
import AppError from "../../errorHelpers/AppError"
import { TransactionStatus, TransactionType } from "../transaction/transaction.interface"
import { Transaction } from "../transaction/transaction.model"
import { agentApprovalStatus, IUser, Role } from "../user/user.interface"
import User from "../user/user.model"
import { IWallet } from "../wallet/wallet.interface"
import Wallet from "../wallet/wallet.model"
const agentRequest = async (decodedToken: JwtPayload) => {
    const user = await User.findOne({ _id: decodedToken.userId })
    if (!user) {
        throw new AppError(httpStatus.BAD_REQUEST, "User not found")
    }
    if (decodedToken.role === Role.AGENT) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized")
    }
    if (user.agentApprovalStatus === agentApprovalStatus.PENDING) {
        throw new AppError(httpStatus.BAD_REQUEST, "Your request is already pending")
    }
    if (user.agentApprovalStatus === agentApprovalStatus.REJECTED) {
        throw new AppError(httpStatus.BAD_REQUEST, "Your rejected by admin")
    }
    if (user.agentApprovalStatus === agentApprovalStatus.APPROVED) {
        throw new AppError(httpStatus.BAD_REQUEST, "Your already a agent")
    }
    const updatedUser = await User.findOneAndUpdate({ _id: decodedToken.userId }, { agentApprovalStatus: agentApprovalStatus.PENDING }, { new: true, runValidators: true })
    return updatedUser
}
const agentApprovalRejectedStatus = async (payload: Partial<IUser>) => {
    const user = await User.findOne({ _id: payload._id });
    if (!user) {
        throw new AppError(httpStatus.BAD_REQUEST, "User not found");
    }
    let updateData;
    if (payload.agentApprovalStatus === agentApprovalStatus.REJECTED) {
        updateData = {
            agentApprovalStatus: agentApprovalStatus.REJECTED,
            role: Role.USER
        };
    } else {
        updateData = {
            agentApprovalStatus: agentApprovalStatus.APPROVED,
            role: Role.AGENT
        };
    }

    const updatedUser = await User.findByIdAndUpdate(
        payload._id,
        { $set: updateData },
        { new: true }  // return the updated document
    );

    return updatedUser;
};

// agent send Money to User cash-in
const cashIn = async (payload: Partial<IWallet>, decodedToken: JwtPayload) => {
    const session = await Wallet.startSession();
    session.startTransaction()
    try {
        const wallet = await Wallet.findOne({ ownerId: payload.ownerId}).session(session)
        if (!wallet) {
            throw new AppError(httpStatus.BAD_REQUEST, "Wallet not found")
        }
        const agentWallet = await Wallet.findOne({ ownerId: decodedToken.userId }).session(session)
        if (!agentWallet) {
            throw new AppError(httpStatus.BAD_REQUEST, "Agent wallet not found")
        }
        if (payload.balance === undefined) {
            throw new AppError(httpStatus.BAD_REQUEST, "Amount is required")
        }
        if (agentWallet.balance < payload.balance) {
            throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance")
        }
        agentWallet.balance -= payload.balance
        wallet.balance += payload.balance
        await agentWallet.save({ session })
        await wallet.save({ session })
        const transaction = await Transaction.create([{
            type: TransactionType.CASH_IN,     
            amount: payload.balance as number,
            toWallet: wallet._id,
            initiatedBy: decodedToken.userId,
            status: TransactionStatus.APPROVED
        }], { session })
          await session.commitTransaction();
        session.endSession();
        return { agentWallet, wallet, transaction: transaction[0] }
    } catch (error: any) {
         await session.abortTransaction();
        session.endSession()
        throw new AppError(httpStatus.BAD_REQUEST, error.message)
    }
}

// user send money to agent for cash-out
const cashOut = async (payload: Partial<IWallet>, decodedToken: JwtPayload) => {
     const session = await Wallet.startSession();
    session.startTransaction();
    try {
        const agentWallet = await Wallet.findOne({ ownerId: payload.ownerId }).session(session)
    if (!agentWallet) {
        throw new AppError(httpStatus.BAD_REQUEST, "Agent wallet not found")
    }
    const userWallet =await Wallet.findOne({ ownerId: decodedToken.userId })
    if (!userWallet) {
        throw new AppError(httpStatus.BAD_REQUEST, "User wallet not found")
    }
    if (payload.balance === undefined) {
        throw new AppError(httpStatus.BAD_REQUEST, "Amount is required")
    }
    if (userWallet.balance < payload.balance) {
        throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance")
    }
    userWallet.balance -= payload.balance
    agentWallet.balance += payload.balance
    await userWallet.save({ session })
    await agentWallet.save({ session })
    const transaction = await Transaction.create([{
        type: TransactionType.CASH_OUT,
        amount: payload.balance as number,
        toWallet: agentWallet._id,
        initiatedBy: decodedToken.userId,
        status: TransactionStatus.APPROVED
    }], { session })
    await session.commitTransaction();
    session.endSession();
    return { userWallet, agentWallet, transaction: transaction[0] }
    } catch (error: any) {
        await session.abortTransaction();
        session.endSession()
        throw new AppError(httpStatus.BAD_REQUEST, error.message)
    }
}
export const AgentServices = {
    agentRequest,
    agentApprovalRejectedStatus,
    cashIn,
     cashOut
}