import { NextFunction } from "express";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors";
import OrderModel from "../models/orderModel";



export const newOrder = catchAsyncErrors(async (data: any, next: NextFunction) => {
    const order = await OrderModel.create(data);
    next(order);

});
