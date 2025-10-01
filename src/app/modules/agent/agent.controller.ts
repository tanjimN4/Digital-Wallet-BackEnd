/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AgentServices } from "./agent.services";
const agentRequest =catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const verifiedToken=req.user
    const request = await AgentServices.agentRequest(verifiedToken as JwtPayload)
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Agent request sent successfully",
        data: request
    })

})
const agentApprovalRejectedStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("body",req.body);
    
    const result = await AgentServices.agentApprovalRejectedStatus(
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Agent status updated successfully",
      data: result,
    });
  }
);


const cashIn =catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const verifiedToken=req.user
    const request = await AgentServices.cashIn(req.body, verifiedToken as JwtPayload)
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "cash in successfully",
        data: request
    })
})
const cashOut=catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const verifiedToken=req.user
    const request = await AgentServices.cashOut(req.body, verifiedToken as JwtPayload)
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "cash out successfully",
        data: request
    })
})

export const AgentControllers = {
    agentRequest,
    agentApprovalRejectedStatus,
    cashIn,
    cashOut
}