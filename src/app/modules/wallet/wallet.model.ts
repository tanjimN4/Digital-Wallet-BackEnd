import { model, Schema } from "mongoose";
import { IWallet, walletStatus } from "./wallet.interface";

const walletSchema = new Schema<IWallet>({
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', unique: true},
    balance: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: Object.values(walletStatus), default: walletStatus.ACTIVE }

},
    {
        timestamps: true,
        versionKey: false,
    })

const Wallet = model<IWallet>('Wallet', walletSchema)

export default Wallet