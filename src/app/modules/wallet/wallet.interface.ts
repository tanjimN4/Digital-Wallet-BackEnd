import { Types } from "mongoose";

export enum walletStatus {
    ACTIVE = "ACTIVE",
    BLOCKED = "BLOCKED",
}

export interface IWallet {
    balance: number;
    ownerId: Types.ObjectId;
    status?: walletStatus;
}