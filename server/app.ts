require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";
import userRouter from "./routes/user.routes";
import courseRouter from "./routes/course.route";

//body parser
app.use(express.json({ limit: "50mb" }));

//cookie parser
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.ORIGIN,
  }),
);

app.use("/api/v1", userRouter);

app.use("/api/v1", courseRouter);

//testing route
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "Hello from server",
  });
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(
    `cant find the route ${req.originalUrl} on this server`,
  ) as any;
  err.statusCode = 404;
  next(err);
});

app.use(ErrorMiddleware);
