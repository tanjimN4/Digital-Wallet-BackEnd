import { Types } from "mongoose";

export enum Role{
    USER="USER",
    ADMIN="ADMIN",
    AGENT="AGENT",
    SUPER_ADMIN="SUPER_ADMIN"
}

export interface IAuthProvider{
    provider:"google"|"credentials",
    providerId:string
}

export enum IsBlocked {
    ACTIVE = "ACTIVE",
    BLOCKED = "BLOCKED",
}
export enum agentApprovalStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    NOT_AGENT = "NOT_AGENT",
}

export interface IUser{
     _id?: Types.ObjectId,
    name:string,
    email:string,
    password?:string,
    phone?: string;
    picture?: string;
    address?: string;
    isBlocked?: IsBlocked
    role:Role,
    auths:IAuthProvider[],
    walletId?:Types.ObjectId,
    agentApprovalStatus?:agentApprovalStatus
}