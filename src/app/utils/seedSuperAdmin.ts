import bcryptjs from "bcryptjs";
import { envVars } from "../config/env";
import { IAuthProvider, IUser, Role } from "../modules/user/user.interface";
import User from "../modules/user/user.model";
import Wallet from "../modules/wallet/wallet.model";
export const seedSuperAdmin = async () => {
    try {
        const isSuperAdminExist = await User.findOne({ email: envVars.SUPER_ADMIN_EMAIL})

        if (isSuperAdminExist) {
            console.log('super admin is all ready exist');
            return
        }
        const hashedPassword = await bcryptjs.hash(envVars.SUPER_ADMIN_PASSWORD as string, Number(envVars.BCRYPT_SALT_ROUND))

        const authProvider: IAuthProvider = {
            provider: "credentials",
            providerId: envVars.SUPER_ADMIN_EMAIL as string
        }
        const payload: IUser = {
            name: "Super admin",
            email: envVars.SUPER_ADMIN_EMAIL,
            role: Role.SUPER_ADMIN,
            password: hashedPassword,
            auths: [authProvider]
        }

        const superAdmin = await User.create(payload)

        const wallet = await Wallet.create({
            ownerId: superAdmin._id,
            balance: 50,
        })
        // Update superAdmin with walletId
        superAdmin.walletId = wallet._id;
        await superAdmin.save();
        console.log("super admin created successfully");
    } catch (error) {
        console.log(error);

    }
}