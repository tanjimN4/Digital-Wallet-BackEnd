import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validationRequest } from "../../middlewares/validationRequest";
import { UserControllers } from "./user.controller";
import { Role } from "./user.interface";
import { blockUserZodSchema, createUserZodSchema, unBlockUserZodSchema, updateUserZodSchema } from "./user.validation";

const router=Router();

router.post("/register",
    validationRequest(createUserZodSchema),
    UserControllers.createUser
)
router.patch("/:id",
    checkAuth(...Object.values(Role)),
    validationRequest(updateUserZodSchema),
    UserControllers.updateUser
)
router.get("/all-users",
    checkAuth(Role.ADMIN,Role.SUPER_ADMIN),
     UserControllers.getAllUsers)
router.get("/get-me",
    checkAuth(...Object.values(Role)),
     UserControllers.getMe)

router.patch("/block/:id",
    checkAuth(Role.ADMIN,Role.SUPER_ADMIN),
    validationRequest(blockUserZodSchema),
    UserControllers.blockUser
)
router.patch("/unblock/:id",
    checkAuth(Role.ADMIN,Role.SUPER_ADMIN),
    validationRequest(unBlockUserZodSchema),
    UserControllers.unBlockUser
)



export const UserRoutes=router