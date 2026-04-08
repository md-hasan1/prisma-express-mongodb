import xss from 'xss';
import { isEmail, isURL, trim, escape } from 'validator';

/**
 * Sanitize string inputs to prevent XSS attacks
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return input;
  
  // Remove XSS attempts
  const sanitized = xss(input, {
    whiteList: {}, // No HTML tags allowed
        stripIgnoreTag: true, // Remove all HTML tags,
        stripIgnoreTagBody: ['script'], // Remove content of script tags
  });
  
  return trim(sanitized);
};

/**
 * Sanitize email addresses
 */
export const sanitizeEmail = (email: string): string => {
  const trimmed = trim(email?.toLowerCase() || '');
  
  if (!isEmail(trimmed)) {
    throw new Error('Invalid email format');
  }
  
  return trimmed;
};

/**
 * Sanitize URLs
 */
export const sanitizeUrl = (url: string): string => {
  const trimmed = trim(url);
  
  if (!isURL(trimmed)) {
    throw new Error('Invalid URL format');
  }
  
  return trimmed;
};

/**
 * Sanitize phone numbers (basic)
 */
export const sanitizePhone = (phone: string): string => {
  // Remove all non-numeric characters except + at start
  const sanitized = trim(phone).replace(/[^\d+]/g, '');
  
  if (sanitized.length < 10 || sanitized.length > 15) {
    throw new Error('Invalid phone number');
  }
  
  return sanitized;
};

/**
 * Sanitize numbers
 */
export const sanitizeNumber = (num: any): number => {
  const parsed = Number(num);
  
  if (isNaN(parsed)) {
    throw new Error('Invalid number');
  }
  
  return parsed;
};

/**
 * Deep sanitize object (recursive)
 */
export const sanitizeObject = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized: any = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
};

/**
 * Sanitize user profile data
 */
export const sanitizeUserInput = (data: any) => {
  return {
    fullName: data.fullName ? sanitizeString(data.fullName) : undefined,
    email: data.email ? sanitizeEmail(data.email) : undefined,
    phone: data.phone ? sanitizePhone(data.phone) : undefined,
    country: data.country ? sanitizeString(data.country) : undefined,
    password: data.password, // Don't sanitize password
    organization: data.organization ? sanitizeString(data.organization) : undefined,
  };
};
