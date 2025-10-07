import { Router } from 'express';
import bcrypt from 'bcryptjs';
import {
  asyncHandler,
  ValidationError,
  AuthenticationError,
  NotFoundError,
} from '../middleware/errorHandler';
import {
  authenticate,
  generateToken,
  AuthRequest,
  JWTPayload,
} from '../middleware/auth';
import { loginRateLimiter, rateLimiter } from '../middleware/rateLimiter';

const router = Router();

// In-memory user storage (replace with database in production)
interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  subscription: 'free' | 'premium';
  generationsLeft: number;
  createdAt: Date;
  updatedAt: Date;
}

const users: User[] = [];

/**
 * POST /api/users/register
 * Register a new user
 */
router.post(
  '/register',
  rateLimiter, // General IP-based rate limiting
  asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      throw new ValidationError('Email, password, and name are required');
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      throw new ValidationError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      password: hashedPassword,
      name,
      role: 'user',
      subscription: 'free',
      generationsLeft: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.push(user);

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      subscription: user.subscription,
    });

    // Return user data (without password)
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          subscription: user.subscription,
          generationsLeft: user.generationsLeft,
        },
        token,
      },
    });
  })
);

/**
 * POST /api/users/login
 * Login user
 */
router.post(
  '/login',
  loginRateLimiter, // Email-based rate limiting (5 failed attempts per email)
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Find user
    const user = users.find((u) => u.email === email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      subscription: user.subscription,
    });

    // Return user data (without password)
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          subscription: user.subscription,
          generationsLeft: user.generationsLeft,
        },
        token,
      },
    });
  })
);

/**
 * GET /api/users/me
 * Get current user profile
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = users.find((u) => u.id === req.user?.userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          subscription: user.subscription,
          generationsLeft: user.generationsLeft,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  })
);

/**
 * PUT /api/users/me
 * Update current user profile
 */
router.put(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = users.find((u) => u.id === req.user?.userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    const { name, email } = req.body;

    // Update user
    if (name) user.name = name;
    if (email) {
      // Check if email is already taken
      const existingUser = users.find((u) => u.email === email && u.id !== user.id);
      if (existingUser) {
        throw new ValidationError('Email is already taken');
      }
      user.email = email;
    }

    user.updatedAt = new Date();

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          subscription: user.subscription,
          generationsLeft: user.generationsLeft,
          updatedAt: user.updatedAt,
        },
      },
    });
  })
);

/**
 * POST /api/users/change-password
 * Change user password
 */
router.post(
  '/change-password',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = users.find((u) => u.id === req.user?.userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ValidationError('Current password and new password are required');
    }

    if (newPassword.length < 6) {
      throw new ValidationError('New password must be at least 6 characters');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    user.updatedAt = new Date();

    res.json({
      success: true,
      message: 'Password updated successfully',
    });
  })
);

/**
 * DELETE /api/users/me
 * Delete user account
 */
router.delete(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const userIndex = users.findIndex((u) => u.id === req.user?.userId);

    if (userIndex === -1) {
      throw new NotFoundError('User');
    }

    users.splice(userIndex, 1);

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  })
);

export { router as userRouter };
