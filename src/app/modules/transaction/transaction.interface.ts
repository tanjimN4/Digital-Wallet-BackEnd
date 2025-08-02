import { Types } from "mongoose";

export enum TransactionType {
    DEPOSIT = "DEPOSIT",
    WITHDRAW = "WITHDRAW",
    SEND_MONEY = "SEND_MONEY",
    CASH_IN = "CASH_IN",
    CASH_OUT = "CASH_OUT"
}

export enum TransactionStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}

export interface ITransaction {
    _id?: Types.ObjectId,
    type: TransactionType,
    amount: number,
    fee?: number;
    commission?: number;
    // Wallet from which money is deducted
    fromWallet?: Types.ObjectId;
    // Wallet to which money is added
    toWallet?: Types.ObjectId;
    // Who initiated the transaction (user/agent)
    initiatedBy: Types.ObjectId;
    // Current status of transaction
    status: TransactionStatus;
}