import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError, AuthorizationError } from './errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role?: 'user' | 'admin';
  subscription?: 'free' | 'premium';
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

/**
 * Generate JWT token
 */
export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new AuthenticationError('Invalid or expired token');
  }
};

/**
 * Authentication middleware
 * Validates JWT token from Authorization header
 */
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = verifyToken(token);

    // Attach user to request
    req.user = payload;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Does not throw error if no token, just attaches user if valid token exists
 */
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      req.user = payload;
    }

    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};

/**
 * Authorization middleware
 * Checks if user has required role
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      const userRole = req.user.role || 'user';

      if (!allowedRoles.includes(userRole)) {
        throw new AuthorizationError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Subscription middleware
 * Checks if user has required subscription level
 */
export const requireSubscription = (...allowedPlans: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      const userSubscription = req.user.subscription || 'free';

      if (!allowedPlans.includes(userSubscription)) {
        return res.status(402).json({
          success: false,
          error: {
            message: 'Premium subscription required',
            statusCode: 402,
            requiredPlans: allowedPlans,
            currentPlan: userSubscription,
          },
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * API Key authentication middleware
 * For server-to-server communication
 */
export const authenticateApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = req.headers['x-api-key'];
    const validApiKeys = process.env.API_KEYS?.split(',') || [];

    if (!apiKey || !validApiKeys.includes(apiKey as string)) {
      throw new AuthenticationError('Invalid API key');
    }

    next();
  } catch (error) {
    next(error);
  }
};
