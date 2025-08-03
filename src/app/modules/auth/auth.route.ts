import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { AuthControllers } from "./auth.controller";

const router=Router()

router.post("/login",
    AuthControllers.credentialsLogin
)
router.post("/refresh-token",
    AuthControllers.getNewAccessToken
)
router.post('/logout',AuthControllers.logout)
router.post('/reset-password',checkAuth(...Object.values(Role)),AuthControllers.resetPassword)
//google login
router.get('/google',async(req:Request,res :Response,next:NextFunction)=>{
    const redirect = req.query.redirect || "/"
    passport.authenticate('google', { scope: ['email', 'profile'],state:redirect as string })(req, res, next);
})
router.get('/google/callback',passport.authenticate('google', { failureRedirect: '/login' }),AuthControllers.googleCallBackController)

export const AuthRoutes=router