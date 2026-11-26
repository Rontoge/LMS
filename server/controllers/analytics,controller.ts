import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors";
import { generateaLast12MonthsData } from "../utils/analytics.generator";
import userModel from "../models/user.model";
import courseModel from "../models/course.model";
import orderModel from "../models/orderModel";

// Get user analytics --- admin

export const getUserAnalytics = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await generateaLast12MonthsData(userModel);
      res.status(200).json({
        success: true,
        message: "User analytics fetched successfully",
        data: users,
      });
    } catch (error) {
      return next(new ErrorHandler("Failed to get user analytics", 500));
    }
  },
);


// Get courses analytics --- admin

export const getCoursesAnalytics = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courses = await generateaLast12MonthsData(courseModel);
      res.status(200).json({
        success: true,
        message: "Courses analytics fetched successfully",
        data: courses,
      });
    } catch (error) {
      return next(new ErrorHandler("Failed to get courses analytics", 500));
    }
  },
);


// Get orders analytics --- admin

export const getOrdersAnalytics = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await generateaLast12MonthsData(orderModel);
      res.status(200).json({
        success: true,
        message: "Orders analytics fetched successfully",
        data: orders,
      });
    } catch (error) {
      return next(new ErrorHandler("Failed to get orders analytics", 500));
    }
  },
);