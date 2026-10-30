import { Request, Response, NextFunction } from "express";
import OrderModel, { IOrder } from "../models/orderModel";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import UserModel from "../models/user.model";
import CourseModel from "../models/course.model";
import path from "path";
import ejs from "ejs";
import sendmail from "../utils/sendmail";
import NotificationModel from "../models/notificationModel";
import { newOrder } from "../services/order.service";

export const createOrder = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, payment_Info } = req.body as IOrder;

      const user = await UserModel.findById(req.user?._id);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      const courseExits = user?.courses.some(
        (course: any) => course._id.toString() === courseId.toString(),
      );

      if (courseExits) {
        return next(
          new ErrorHandler("You have already purchased this course", 400),
        );
      }

      const course = await CourseModel.findById(courseId);
      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      const data: any = {
        courseId: course?._id.toString(),
        userId: user?._id.toString(),
        payment_Info,
      };

      const mailData = {
        order: {
          _id: data._id.slice(0, 6),
          name: course?.name,
          price: course?.price,
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      };

      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/order-confirmation.ejs"),
        { order: mailData },
      );

      try {
        if (user) {
          await sendmail({
            email: user.email,
            subject: "Order Confirmation",
            template: "order-confirmation.ejs",
            data: mailData,
          });
        }
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }

      user.courses.push({ courseId: course._id.toString() });
      await user.save();

      await NotificationModel.create({
        userId: user?._id.toString(),
        title: "New-Order",
        message: `you have a new order from ${course?.name}`,
      });

      newOrder(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);
