import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validationRequest } from "../../middlewares/validationRequest";
import { Role } from "../user/user.interface";
import { TransactionController } from "./transaction.controller";
import { addMoneyZodSchema, withdrawMoneyZodSchema } from "./transection.validation";

const router=Router();

router.post("/deposit",
     checkAuth(Role.USER),
      validationRequest(addMoneyZodSchema),
    TransactionController.addMoney
)
router.post("/withdraw",
    checkAuth(Role.USER),
    validationRequest(withdrawMoneyZodSchema),
    TransactionController.withdrawMoney
)
router.post("/send-money",
    checkAuth(Role.USER),
    TransactionController.sendMoney
)

router.get("/my-transaction-history",
     checkAuth(Role.USER,Role.AGENT),
    TransactionController.getMyTransactionHistory
)
router.get("/all-transaction",
    checkAuth(Role.ADMIN,Role.SUPER_ADMIN),
    TransactionController.getAllTransactions
)
export const TransactionRoutes=router