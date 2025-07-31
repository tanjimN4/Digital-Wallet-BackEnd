import { Response } from "express";

interface TMeta{
    total: number,
}

interface TResponse<T>{
    meta?: TMeta,
    data: T,
    statusCode: number,
    success: boolean,
    message: string,
}

export const sendResponse = <T>(res: Response, data:TResponse<T>)=> {
     res.status(data.statusCode).json({
        success: data.success,
        message: data.message,
        meta: data.meta,
        data: data.data
    })
}