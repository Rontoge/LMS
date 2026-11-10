import express from "express";
import { isAuthenticated, authorizeRoles } from "../middleware/auth";
import { getNotifications, updatenoficationStatus } from "../controllers/notification";

const notificationRouter = express.Router();


notificationRouter.get("/get-all-notifications", isAuthenticated, authorizeRoles("admin"), getNotifications);
notificationRouter.put("/update-notification-status/:id", isAuthenticated, authorizeRoles("admin"), updatenoficationStatus);






export default notificationRouter;
