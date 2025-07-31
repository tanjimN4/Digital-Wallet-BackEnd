import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/user/user.route";

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
]

moduleRoutes.forEach(route => {
    router.use(route.path, route.router);
});