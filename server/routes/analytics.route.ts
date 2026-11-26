import express from "express";
import { getCoursesAnalytics, getOrdersAnalytics, getUserAnalytics } from "../controllers/analytics,controller";
import { isAuthenticated ,authorizeRoles } from "../middleware/auth";

const analyticsRouter = express.Router();


analyticsRouter.get("/user-analytics",isAuthenticated,authorizeRoles("admin"), getUserAnalytics);
analyticsRouter.get("/courses-analytics",isAuthenticated,authorizeRoles("admin"), getCoursesAnalytics);
analyticsRouter.get("/orders-analytics",isAuthenticated,authorizeRoles("admin"), getOrdersAnalytics);


export default analyticsRouter;