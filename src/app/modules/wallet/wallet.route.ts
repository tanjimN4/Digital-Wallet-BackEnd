import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { WalletControllers } from "./wallet.controller";

const router=Router();

//admin and super admin access
router.get("/all-wallet",
    checkAuth(Role.ADMIN,Role.SUPER_ADMIN),
     WalletControllers.getAllWallet)

export const WalletRoutes=router