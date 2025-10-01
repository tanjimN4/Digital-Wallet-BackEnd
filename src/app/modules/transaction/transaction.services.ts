/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";
import User from "../user/user.model";
import Wallet from "../wallet/wallet.model";
import { ITransaction, TransactionStatus, TransactionType } from "./transaction.interface";
import { Transaction } from "./transaction.model";
import { QueryBuilder } from "../../utils/QueryBuilder";
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

const getAllTransactions = async (query: Record<string, string>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const pipeline: any[] = [];

  // Status / Type filter (direct on transaction)
  const match: Record<string, any> = {};
  if (query.status) match.status = query.status;
  if (query.type) match.type = query.type;
  if (Object.keys(match).length > 0) {
    pipeline.push({ $match: match });
  }

  // Lookup wallets
  pipeline.push(
    {
      $lookup: {
        from: "wallets",
        localField: "fromWallet",
        foreignField: "_id",
        as: "fromWallet",
      },
    },
    { $unwind: { path: "$fromWallet", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "wallets",
        localField: "toWallet",
        foreignField: "_id",
        as: "toWallet",
      },
    },
    { $unwind: { path: "$toWallet", preserveNullAndEmptyArrays: true } }
  );

  // Search filter on ownerId (inside wallets)
  if (query.search) {
    pipeline.push({
      $match: {
        $or: [
          { "fromWallet.ownerId": query.search },
          { "toWallet.ownerId": query.search },
        ],
      },
    });
  }

  // Sorting, pagination
  pipeline.push(
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit }
  );

  const transactions = await Transaction.aggregate(pipeline);

  // Total count (apply same filters for count)
  const totalPipeline: any[] = [];
  if (Object.keys(match).length > 0) totalPipeline.push({ $match: match });
  if (query.search) {
    totalPipeline.push(
      {
        $lookup: {
          from: "wallets",
          localField: "fromWallet",
          foreignField: "_id",
          as: "fromWallet",
        },
      },
      { $unwind: { path: "$fromWallet", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "wallets",
          localField: "toWallet",
          foreignField: "_id",
          as: "toWallet",
        },
      },
      { $unwind: { path: "$toWallet", preserveNullAndEmptyArrays: true } },
      {
        $match: {
          $or: [
            { "fromWallet.ownerId": query.search },
            { "toWallet.ownerId": query.search },
          ],
        },
      }
    );
  }

  const totalResult = await Transaction.aggregate([...totalPipeline, { $count: "total" }]);
  const total = totalResult[0]?.total || 0;

  return {
    data: transactions,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

export const TransactionServices = {
    addMoney,
    withdrawMoney,
    sendMoney,
    getMyTransactionHistory,
    getAllTransactions
}