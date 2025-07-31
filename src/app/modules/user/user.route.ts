import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validationRequest } from "../../middlewares/validationRequest";
import { UserControllers } from "./user.controller";
import { Role } from "./user.interface";
import { createUserZodSchema } from "./user.validation";

const router=Router();

router.post("/register",
    validationRequest(createUserZodSchema),
    UserControllers.createUser
)
router.get("/all-users",
    checkAuth(Role.ADMIN,Role.SUPER_ADMIN),
     UserControllers.getAllUsers)

export const UserRoutes=router