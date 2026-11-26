import { Response ,Request ,NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors";

//  create a new layout


export const createLayout = catchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try{

        }catch(error){
            return next(new ErrorHandler(error.message, 500));
        }
    })