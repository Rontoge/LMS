import { Request , Response , NextFunction } from "express";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";



// upload Course


export const uploadCourse = catchAsyncErrors(async (req:Request , res: Response   ,  next : NextFunction)=>{
    try {
        
    } catch (error :any) {
        return next(new ErrorHandler(error.message,500))
        
    }
})