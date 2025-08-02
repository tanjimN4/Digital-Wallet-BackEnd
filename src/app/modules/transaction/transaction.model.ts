import { model, Schema } from "mongoose";
import { ITransaction, TransactionStatus, TransactionType } from "./transaction.interface";

const transactionSchema = new Schema<ITransaction>(
    {
        type: { type: String, required: true, enum: Object.values(TransactionType) },
        amount: { type: Number, required: true },
        fee: { type: Number },
        commission: { type: Number },
        fromWallet: { type: Schema.Types.ObjectId, ref: 'Wallet' },
        toWallet: { type: Schema.Types.ObjectId, ref: 'Wallet' },
        initiatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: Object.values(TransactionStatus), default: TransactionStatus.PENDING }
    },
    {
        timestamps: true,
        versionKey: false

    })

export const Transaction = model<ITransaction>('Transaction', transactionSchema)