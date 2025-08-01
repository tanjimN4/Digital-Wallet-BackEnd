import { TGenericErrorResponse } from "../interfaces/error.types"

/* eslint-disable @typescript-eslint/no-explicit-any */
export const handleDuplicateError = (err: any): TGenericErrorResponse => {
    const message = `${Object.keys(err.keyValue)} ${Object.values(err.keyValue)} already exists`
    return {
        statusCode: 400,
        message: message
    }
}
