import { Request, Response, NextFunction } from 'express';
import { sanitizeObject } from '../../helpars/sanitization';


/**
 * Middleware to sanitize all incoming requests (body, query, params)
 * Prevents XSS attacks by cleaning user inputs
 */
export const xssProtectionMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query) as any;
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params) as any;
    }

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid input detected',
      error: error instanceof Error ? error.message : 'Sanitization failed',
    });
  }
};

export default xssProtectionMiddleware;
