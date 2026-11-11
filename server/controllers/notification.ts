import { NextFunction, Request, Response } from "express";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cron from "node-cron";
import NotificationModel from "../models/notificationModel";

// get all notifications for admin

export const getNotifications = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notifications = await NotificationModel
        .find()
        .sort({ createdAt: -1 });
      res.status(201).json({
        success: true,
        notifications,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

//   update anotification status

export const updatenoficationStatus = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notification = await NotificationModel.findById(req.params.id);
      if (!notification) {
        return next(new ErrorHandler("Notification not found", 404));
      } else {
        notification.status
          ? (notification.status = "read")
          : notification?.status;
      }

      await notification.save();

      const notifications = await NotificationModel
        .find()
        .sort({ createdAt: -1 });

      res.status(201).json({
        success: true,
        message: "Notification status updated successfully",
        notifications,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// delete a notification--- admin
cron.schedule("0 0 0 * * *", async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Calculate the date 30 days ago
  await NotificationModel.deleteMany({status: "read", createdAt: { $lt: thirtyDaysAgo } }); // Delete notifications older than 30 days
  console.log("Deleted read notifications older than 30 days");
})