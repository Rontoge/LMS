import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";

export const ErrorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  //wrong mongodb id
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // duplicate key error
  if (err.code === 11000) {
    const messsage = `Duplicatae ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(messsage, 400);
  }

  // wrong jwt error

  if (err.code === "JsonWebTokenError") {
    const message = `Json web token is invalid , please try again `;
    err = new ErrorHandler(message, 400);
  }

  // JWT expired error
  if (err.code === "TokenExpiredError") {
    const message = `Json web token is expired , please try again `;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
