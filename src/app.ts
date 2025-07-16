import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import GlobalErrorHandler from "./app/middlewares/globalErrorHandler";
import router from "./app/routes";

const app: Application = express();

export const corsOptions = {
  origin: ["http://localhost:3001", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "X-Requested-With",
    "Origin",
    "Cache-Control",
    "X-CSRF-Token",
    "User-Agent",
    "Content-Length",
  ],
  credentials: true,
};

// Rate limiter middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000,
  keyGenerator: (req: any) => {
        // Extract IP address from the X-Forwarded-For header safely
        const forwardedFor = req.headers['x-forwarded-for'];
        const ipArray = forwardedFor ? forwardedFor.split(/\s*,\s*/) : [];
        const ipAddress = ipArray.length > 0 ? ipArray[0] : req.connection.remoteAddress;
        return ipAddress;
    },
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware setup
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.send({
    success: true,
    statusCode: httpStatus.OK,
    message: "The server is running!",
  });
});

// Rate limit only for API routes
app.use("/api/v1", apiLimiter, router);

// Global error handler
app.use(GlobalErrorHandler);

// Not found handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;
