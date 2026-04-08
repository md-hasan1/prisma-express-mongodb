import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import GlobalErrorHandler from "./app/middlewares/globalErrorHandler";
import router from "./app/routes";
import morgan from 'morgan';
import path from "path";
import createSystemLogger from "./app/middlewares/logger";
import xssProtectionMiddleware from "./app/middlewares/xssProtection";
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
const loggerFormat = ':method :url :status :res[content-length] - :response-time ms';
app.set("view engine", "ejs");
const logger = createSystemLogger();
// app.set("views", "./src/views");
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  keyGenerator: (req: any) => {
      
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
app.use(helmet()); // Add security headers
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xssProtectionMiddleware); // XSS protection - sanitize inputs
app.use(express.static("public"));
app.use(morgan(loggerFormat)); 
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use((req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        logger.logRequest(req.method, req.path, res.statusCode, responseTime);
    });
    
    next();
});
// // Root endpoint
// app.get("/", (req: Request, res: Response) => {
// res.render("index.ejs");
// });
// Root endpoint
app.get("/", (req: Request, res: Response) => {
res.status(200).json({message:"server is running"})
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
