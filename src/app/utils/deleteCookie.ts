import { Response } from "express";

export interface AuthTokens {
    accessToken?: string;
    refreshToken?: string;
}
export const deleteCookie=(res: Response, tokenInfo: AuthTokens) => {
    if (tokenInfo.accessToken) {
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        })
    }
    if (tokenInfo.refreshToken) {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: false
        })
    }
}