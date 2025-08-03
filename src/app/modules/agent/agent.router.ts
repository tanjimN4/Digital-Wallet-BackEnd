import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { AgentControllers } from "./agent.controller";

const router = Router()

router.post("/agent-request",
    checkAuth(Role.USER),
    AgentControllers.agentRequest
)
router.patch("/agent-approval-reject-status",
    checkAuth(Role.ADMIN,Role.SUPER_ADMIN),
    AgentControllers.agentApprovalRejectedStatus
)
router.post("/cash-in",
    checkAuth(Role.AGENT),
    AgentControllers.cashIn
)
router.post("/cash-out",
    checkAuth(Role.USER),
    AgentControllers.cashOut
)

export const AgentRoutes = router