import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
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
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ValidationError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
    });

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: 'user',
      subscription: 'free',
    });

    // Return user data (without password)
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
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
    const user = await User.findOne({ email });
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
      userId: user._id.toString(),
      email: user.email,
      role: 'user',
      subscription: 'free',
    });

    // Return user data (without password)
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
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
    const user = await User.findById(req.user?.userId).select('-password');

    if (!user) {
      throw new NotFoundError('User');
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
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
    const user = await User.findById(req.user?.userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    const { name, email } = req.body;

    // Update user
    if (name) user.name = name;
    if (email) {
      // Check if email is already taken
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        throw new ValidationError('Email is already taken');
      }
      user.email = email;
    }

    await user.save();

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
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
    const user = await User.findById(req.user?.userId);

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
    await user.save();

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
    const user = await User.findByIdAndDelete(req.user?.userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  })
);

export { router as userRouter };
