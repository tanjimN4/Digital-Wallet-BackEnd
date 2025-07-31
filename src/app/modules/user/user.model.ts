import mongoose, { model } from "mongoose";
import { agentApprovalStatus, IsBlocked, IUser, Role } from "./user.interface";

const authProviderSchema = new mongoose.Schema({
    provider: {
        type: String,
        required: true
    },
    providerId: {
        type: String,
        required: true
    }
},
    {
        versionKey: false,
        _id: false
    })

const userSchema = new mongoose.Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String },
    phone: { type: String },
    picture: { type: String },
    address: { type: String },
    isBlocked: { type: String, enum: Object.values(IsBlocked), default: IsBlocked.ACTIVE },
    role: { type: String, required: true, enum: Object.values(Role), default: Role.USER },
    auths: [authProviderSchema],
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet'},
    agentApprovalStatus: {
    type: String,
    enum: Object.values(agentApprovalStatus),
    required: function () {
      return this.role === Role.AGENT;
    },
    default: agentApprovalStatus.NOT_AGENT
  }
},
    {
        timestamps: true,
        versionKey: false
    })
userSchema.pre("save", function (next) {
    if (this.role === Role.AGENT) {
        this.agentApprovalStatus = agentApprovalStatus.PENDING;
    }else{
        this.agentApprovalStatus = agentApprovalStatus.NOT_AGENT
    }
    next();
})

const User = model<IUser>('User', userSchema)

export default User