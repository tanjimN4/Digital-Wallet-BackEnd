/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";
import User from "../user/user.model";
import Wallet from "../wallet/wallet.model";
import { ITransaction, TransactionStatus, TransactionType } from "./transaction.interface";
import { Transaction } from "./transaction.model";
const addMoney = async (payload: Partial<ITransaction>, decodedToken: JwtPayload) => {
    const session = await Wallet.startSession();
    session.startTransaction();

    try {
        if (payload.amount) {
            if (payload.amount === 0 || payload.amount < 0) {
                throw new AppError(httpStatus.BAD_REQUEST, "Amount must be greater than 0")
            }
        }
        const wallet = await Wallet.findOne({ ownerId: decodedToken.userId }).session(session)
        if (!wallet) {
            throw new AppError(httpStatus.BAD_REQUEST, "Wallet not found")
        }
        wallet.balance += payload.amount as number
        const updatedWallet = await wallet.save({ session })
        const transaction = await Transaction.create(
            [{
                type: TransactionType.DEPOSIT,
                amount: payload.amount,
                toWallet: updatedWallet._id,
                initiatedBy: decodedToken.userId,
                status: TransactionStatus.APPROVED
            }],
            { session }
        );
        await session.commitTransaction();
        session.endSession();
        return { updatedWallet, transaction: transaction[0] }


    } catch (error: any) {
        await session.abortTransaction();
        session.endSession();
        throw new AppError(httpStatus.BAD_REQUEST, error.message)
    }
}

const withdrawMoney = async (payload: Partial<ITransaction>, decodedToken: JwtPayload) => {
    const session = await Wallet.startSession();
    session.startTransaction();

    try {
        if (payload.amount) {
            if (payload.amount === 0 || payload.amount < 0) {
                throw new AppError(httpStatus.BAD_REQUEST, "Amount must be greater than 0")
            }
        }
        const wallet = await Wallet.findOne({ ownerId: decodedToken.userId }).session(session)
        if (!wallet) {
            throw new AppError(httpStatus.BAD_REQUEST, "Wallet not found")
        }
        if (payload.amount === undefined) {
            throw new AppError(httpStatus.BAD_REQUEST, "Amount is required")
        }
        if (wallet.balance < payload.amount) {
            throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance")
        }
        wallet.balance -= payload.amount;
        const updatedWallet = await wallet.save({ session })
        const transaction = await Transaction.create([{
            type: TransactionType.WITHDRAW,
            amount: payload.amount as number,
            toWallet: updatedWallet._id,
            initiatedBy: decodedToken.userId,
            status: TransactionStatus.APPROVED
        }], { session })
        await session.commitTransaction();
        session.endSession();
        return { updatedWallet, transaction: transaction[0] }

    } catch (error: any) {
        await session.abortTransaction();
        session.endSession();
        throw new AppError(httpStatus.BAD_REQUEST, error.message)
    }
}
const sendMoney = async (payload, decodedToken: JwtPayload) => {
  const session = await Wallet.startSession();
  session.startTransaction();

  try {  
    // Sender wallet
    const wallet = await Wallet.findOne({ ownerId: decodedToken.userId }).session(session);
    if (!wallet) {
      throw new AppError(httpStatus.BAD_REQUEST, "Wallet not found");
    }

    if (payload.balance === undefined) {
      throw new AppError(httpStatus.BAD_REQUEST, "Amount is required");
    }

    if (wallet.balance < payload.balance) {
      throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
    }

    if (!payload.email) {
      throw new AppError(httpStatus.BAD_REQUEST, "Receiver email is required");
    }
    const user = await User.findOne({ email: payload.email }).session(session);
    // Receiver wallet by email
    const receiverWallet = await Wallet.findOne({ ownerId: user?._id }).session(session);
    if (!receiverWallet) {
      throw new AppError(httpStatus.BAD_REQUEST, "Receiver wallet not found");
    }

    // Update balances
    wallet.balance -= payload.balance;
    receiverWallet.balance += payload.balance;

    await wallet.save({ session });
    await receiverWallet.save({ session });

    // Create transaction record
    const transaction = await Transaction.create([{
      type: TransactionType.SEND_MONEY,
      amount: payload.balance as number,
      toWallet: receiverWallet._id,
      initiatedBy: decodedToken.userId,
      status: TransactionStatus.APPROVED,
    }], { session });

    await session.commitTransaction();
    session.endSession();

    return { transaction: transaction[0], senderWallet: wallet, receiverWallet };
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, error.message);
  }
};

export default sendMoney;
const getMyTransactionHistory = async (decodedToken: JwtPayload) => {
    const transactions = await Transaction.find({ initiatedBy: decodedToken.userId })
    return transactions
}

const getAllTransactions = async () => {
    const transactions = await Transaction.find()
    return transactions
}

export const TransactionServices = {
    addMoney,
    withdrawMoney,
    sendMoney,
    getMyTransactionHistory,
    getAllTransactions
}