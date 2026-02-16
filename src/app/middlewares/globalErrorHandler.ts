import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import handleZodError from "../../errors/handleZodError";
import parsePrismaValidationError from "../../errors/parsePrismaValidationError";
import ApiError from "../../errors/ApiErrors";
import fs from 'fs';
import path from 'path';

// TODO Replace `config.NODE_ENV` with your actual environment configuration

// TODO
const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
};
interface ErrorLog {
  time: string;
  status: number;
  method: string;
  path: string;
  message: string;
  user: string;
  stack?: string;
}

const saveErrorToFile = (logObj: ErrorLog) => {
  console.log(__dirname)
  const logsDir = path.join(__dirname, '../logs');
  const logPath = path.join(logsDir, 'errors.log');
  // console.log({logsDir, logPath})

  // 🛡️ Ensure the logs directory exists
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
//test
  const logMessage = `[${logObj.time}] ${logObj.status} - ${logObj.method} ${logObj.path} - ${logObj.message}\nUser: ${logObj.user}\nStack: ${logObj.stack || 'N/A'}\n\n`;

  fs.appendFile(logPath, logMessage, (err) => {
    if (err) {
      console.error('❌ Failed to write error log:', err);
    }
  });
};
const GlobalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode: any = httpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || "Something went wrong!";
  let errorSources = [];
  let errorDetails = err || null;

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  }
  // Handle Custom ApiError
  else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [{ type: "ApiError", details: err.message }];
  }
  // handle prisma client validation errors
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = parsePrismaValidationError(err.message);
    errorSources.push("Prisma Client Validation Error");
  }
  // Prisma Client Initialization Error
  else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message =
      "Failed to initialize Prisma Client. Check your database connection or Prisma configuration.";
    errorSources.push("Prisma Client Initialization Error");
  }
  // Prisma Client Rust Panic Error
  else if (err instanceof Prisma.PrismaClientRustPanicError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message =
      "A critical error occurred in the Prisma engine. Please try again later.";
    errorSources.push("Prisma Client Rust Panic Error");
  }
  // Prisma Client Unknown Request Error
  else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = "An unknown error occurred while processing the request.";
    errorSources.push("Prisma Client Unknown Request Error");
  }
  // Generic Error Handling (e.g., JavaScript Errors)
  else if (err instanceof SyntaxError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Syntax error in the request. Please verify your input.";
    errorSources.push("Syntax Error");
  } else if (err instanceof TypeError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Type error in the application. Please verify your input.";
    errorSources.push("Type Error");
  } else if (err instanceof ReferenceError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Reference error in the application. Please verify your input.";
    errorSources.push("Reference Error");
  }
  // Catch any other error type
  else {
    message = "An unexpected error occurred!";
    errorSources.push("Unknown Error");
  }
  // ✅ Log error to file
  const errorLog = {
    time: new Date().toISOString(),
    status: statusCode,
    message,
    path: req.originalUrl,
    method: req.method,
    user: req.user?.id || "Unauthenticated",
    stack: err.stack || '',
  };

  saveErrorToFile(errorLog); // 💾 RIGHT HERE
  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    err,
    stack: config.NODE_ENV === "development" ? err?.stack : null,
  });
};

export default GlobalErrorHandler;
