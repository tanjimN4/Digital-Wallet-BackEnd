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
router.patch("/:id",
    checkAuth(...Object.values(Role)),
    UserControllers.updateUser
)

//admin and super admin access
router.get("/all-users",
    checkAuth(Role.ADMIN,Role.SUPER_ADMIN),
     UserControllers.getAllUsers)

export const UserRoutes=router