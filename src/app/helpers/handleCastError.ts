import mongoose from "mongoose"
import { TGenericErrorResponse } from "../interface/error.types"


export const handleCastError = (err: mongoose.Error.CastError): TGenericErrorResponse => {
    return {
        statusCode: 400,
        message: `Invalid mongoDb id ${err.path}`
    }
}
