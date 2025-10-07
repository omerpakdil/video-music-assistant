import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store for rate limiting
// In production, use Redis or similar distributed cache
const store: RateLimitStore = {};

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
}

export const createRateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    // Initialize or get existing record
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    const record = store[key];

    // Check if limit exceeded
    if (record.count >= maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

      return res.status(429).json({
        success: false,
        error: {
          message,
          statusCode: 429,
          retryAfter,
        },
      });
    }

    // Increment counter
    record.count++;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count));
    res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

    // Decrement on successful response if configured
    if (skipSuccessfulRequests) {
      res.on('finish', () => {
        if (res.statusCode < 400) {
          record.count = Math.max(0, record.count - 1);
        }
      });
    }

    next();
  };
};

// Default rate limiter: 100 requests per 15 minutes
export const rateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests from this IP, please try again later',
});

// Strict rate limiter for sensitive endpoints (e.g., auth)
export const strictRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many attempts, please try again later',
  skipSuccessfulRequests: true,
});

// Email-based rate limiter for login/register attempts
const emailStore: RateLimitStore = {};

export interface EmailRateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxAttempts: number; // Max failed attempts per email
  message?: string;
}

export const createEmailRateLimiter = (options: EmailRateLimitOptions) => {
  const {
    windowMs,
    maxAttempts,
    message = 'Too many failed attempts for this account, please try again later',
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const email = req.body.email;

    // If no email in body, skip this rate limiter
    if (!email) {
      return next();
    }

    const key = `email:${email.toLowerCase()}`;
    const now = Date.now();

    // Initialize or get existing record
    if (!emailStore[key] || emailStore[key].resetTime < now) {
      emailStore[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    const record = emailStore[key];

    // Check if limit exceeded
    if (record.count >= maxAttempts) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);

      return res.status(429).json({
        success: false,
        error: {
          message,
          statusCode: 429,
          retryAfter,
        },
      });
    }

    // Store response to check if request failed
    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      // Only increment on authentication failures
      if (!body.success && (res.statusCode === 401 || res.statusCode === 400)) {
        record.count++;
      } else if (body.success && res.statusCode < 400) {
        // Reset counter on successful authentication
        record.count = 0;
      }
      return originalJson(body);
    };

    next();
  };
};

// Email-based rate limiter for login attempts (5 failed attempts per 15 minutes per email)
export const loginRateLimiter = createEmailRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 5,
  message: 'Too many failed login attempts for this account, please try again later',
});

// Cleanup old email entries periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(emailStore).forEach((key) => {
    if (emailStore[key].resetTime < now) {
      delete emailStore[key];
    }
  });
}, 60 * 1000); // Cleanup every minute

// API rate limiter for heavy operations
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  message: 'API rate limit exceeded, please slow down',
});

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 60 * 1000); // Cleanup every minute
