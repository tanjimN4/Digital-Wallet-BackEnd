/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";
import { IWallet } from "../wallet/wallet.interface";
import Wallet from "../wallet/wallet.model";
import { ITransaction, TransactionStatus, TransactionType } from "./transaction.interface";
import { Transaction } from "./transaction.model";
const addMoney = async (payload: Partial<ITransaction>, decodedToken: JwtPayload) => {
    try {
        if (payload.amount) {
            if (payload.amount === 0 || payload.amount < 0) {
                throw new AppError(httpStatus.BAD_REQUEST, "Amount must be greater than 0")
            }
        }
        const wallet = await Wallet.findOne({ ownerId: decodedToken.userId })
        if (!wallet) {
            throw new AppError(httpStatus.BAD_REQUEST, "Wallet not found")
        }
        wallet.balance += payload.amount as number
        const updatedWallet = await wallet.save()
        await Transaction.create([{
            type: TransactionType.DEPOSIT,
            amount: payload.amount as number,
            toWallet: updatedWallet._id,
            initiatedBy: decodedToken.userId,
            status: TransactionStatus.APPROVED
        }])
        return { updatedWallet, transaction: await Transaction.findOne({ type: TransactionType.DEPOSIT }) }


    } catch (error: any) {
        throw new AppError(httpStatus.BAD_REQUEST, error.message)
    }
}

const withdrawMoney = async (payload: Partial<ITransaction>, decodedToken: JwtPayload) => {
    try {
        if (payload.amount) {
            if (payload.amount === 0 || payload.amount < 0) {
                throw new AppError(httpStatus.BAD_REQUEST, "Amount must be greater than 0")
            }
        }
        const wallet = await Wallet.findOne({ ownerId: decodedToken.userId })
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
        const updatedWallet = await wallet.save()
        const transaction = await Transaction.create([{
            type: TransactionType.WITHDRAW,
            amount: payload.amount as number,
            toWallet: updatedWallet._id,
            initiatedBy: decodedToken.userId,
            status: TransactionStatus.APPROVED
        }])
        return { updatedWallet, transaction}

    } catch (error: any) {
        throw new AppError(httpStatus.BAD_REQUEST, error.message)
    }
}
const sendMoney = async (payload: Partial<IWallet>, decodedToken: JwtPayload) => {
    try {
        const wallet = await Wallet.findOne({ ownerId: decodedToken.userId })
        if (!wallet) {
            throw new AppError(httpStatus.BAD_REQUEST, "Wallet not found")
        }
        if (payload.balance === undefined) {
            throw new AppError(httpStatus.BAD_REQUEST, "Amount is required")
        }
        if (wallet.balance < payload.balance) {
            throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance")
        }
        const reviverId = await Wallet.findOne({ ownerId: payload.ownerId })
        console.log(reviverId);
        
        if(reviverId){
            wallet.balance -= payload.balance
            reviverId.balance += payload.balance
            await wallet.save()
            await reviverId.save()
            const transaction = await Transaction.create([{
                type: TransactionType.SEND_MONEY,
                amount: payload.balance as number,
                toWallet: reviverId._id,
                initiatedBy: decodedToken.userId,
                status: TransactionStatus.APPROVED
            }])
            return { transaction,reviverId }
        }

        
    } catch (error: any) {
        throw new AppError(httpStatus.BAD_REQUEST, error.message)
    }
}
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