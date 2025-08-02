import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { TransactionRoutes } from "../modules/transaction/transaction.route";
import { UserRoutes } from "../modules/user/user.route";
import { WalletRoutes } from "../modules/wallet/wallet.route";

export const router=Router();

const moduleRoutes=[
    {
        path:"/user",
        router:UserRoutes
    },
    {
        path:"/auth",
        router:AuthRoutes
    },
    {
        path:"/wallet",
        router:WalletRoutes
    },
    {
        path:"/transaction",
        router:TransactionRoutes
    },
]

moduleRoutes.forEach(route => {
    router.use(route.path, route.router);
});