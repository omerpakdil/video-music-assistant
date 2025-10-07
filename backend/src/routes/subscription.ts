import { Router } from 'express';
import {
  asyncHandler,
  ValidationError,
  NotFoundError,
} from '../middleware/errorHandler';
import {
  authenticate,
  requireSubscription,
  AuthRequest,
} from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// In-memory subscription data (replace with database in production)
interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  generationsPerMonth: number | 'unlimited';
}

interface UserSubscription {
  userId: string;
  planId: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  generationsUsed: number;
  generationsLimit: number;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Available subscription plans
const plans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'monthly',
    features: [
      '3 music generations per month',
      'Standard quality exports',
      'MP3 format only',
      'Community support',
    ],
    generationsPerMonth: 3,
  },
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    price: 9.99,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Unlimited music generations',
      'High-quality WAV exports',
      'Commercial licensing',
      'Multiple style variations',
      'Priority processing',
      'Email support',
    ],
    generationsPerMonth: 'unlimited',
  },
  {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    price: 99.99,
    currency: 'USD',
    interval: 'yearly',
    features: [
      'Unlimited music generations',
      'High-quality WAV exports',
      'Commercial licensing',
      'Multiple style variations',
      'Priority processing',
      'Priority email support',
      '2 months free (save 16%)',
    ],
    generationsPerMonth: 'unlimited',
  },
];

const subscriptions: UserSubscription[] = [];

/**
 * GET /api/subscriptions/plans
 * Get all available subscription plans
 */
router.get(
  '/plans',
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      data: {
        plans,
      },
    });
  })
);

/**
 * GET /api/subscriptions/me
 * Get current user's subscription
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const subscription = subscriptions.find((s) => s.userId === req.user?.userId);

    if (!subscription) {
      // Return free plan as default
      res.json({
        success: true,
        data: {
          subscription: {
            planId: 'free',
            status: 'active',
            generationsUsed: 0,
            generationsLimit: 3,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      });
      return;
    }

    const plan = plans.find((p) => p.id === subscription.planId);

    res.json({
      success: true,
      data: {
        subscription: {
          planId: subscription.planId,
          planName: plan?.name,
          status: subscription.status,
          generationsUsed: subscription.generationsUsed,
          generationsLimit: subscription.generationsLimit,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        },
      },
    });
  })
);

/**
 * POST /api/subscriptions/subscribe
 * Subscribe to a plan
 */
router.post(
  '/subscribe',
  authenticate,
  apiRateLimiter,
  asyncHandler(async (req: AuthRequest, res) => {
    const { planId } = req.body;

    if (!planId) {
      throw new ValidationError('Plan ID is required');
    }

    // Validate plan
    const plan = plans.find((p) => p.id === planId);
    if (!plan) {
      throw new NotFoundError('Subscription plan');
    }

    // Check if user already has a subscription
    let subscription = subscriptions.find((s) => s.userId === req.user?.userId);

    const now = new Date();
    const periodEnd = new Date(
      plan.interval === 'yearly'
        ? now.getTime() + 365 * 24 * 60 * 60 * 1000
        : now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    if (subscription) {
      // Update existing subscription
      subscription.planId = planId;
      subscription.status = 'active';
      subscription.generationsUsed = 0;
      subscription.generationsLimit = plan.generationsPerMonth === 'unlimited' ? -1 : plan.generationsPerMonth;
      subscription.currentPeriodStart = now;
      subscription.currentPeriodEnd = periodEnd;
      subscription.cancelAtPeriodEnd = false;
      subscription.updatedAt = now;
    } else {
      // Create new subscription
      subscription = {
        userId: req.user!.userId,
        planId,
        status: 'active',
        generationsUsed: 0,
        generationsLimit: plan.generationsPerMonth === 'unlimited' ? -1 : plan.generationsPerMonth,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        createdAt: now,
        updatedAt: now,
      };
      subscriptions.push(subscription);
    }

    res.json({
      success: true,
      message: 'Successfully subscribed to plan',
      data: {
        subscription: {
          planId: subscription.planId,
          planName: plan.name,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
        },
      },
    });
  })
);

/**
 * POST /api/subscriptions/cancel
 * Cancel subscription
 */
router.post(
  '/cancel',
  authenticate,
  requireSubscription('premium'),
  asyncHandler(async (req: AuthRequest, res) => {
    const subscription = subscriptions.find((s) => s.userId === req.user?.userId);

    if (!subscription) {
      throw new NotFoundError('Subscription');
    }

    // Set to cancel at period end
    subscription.cancelAtPeriodEnd = true;
    subscription.updatedAt = new Date();

    res.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the current period',
      data: {
        subscription: {
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          currentPeriodEnd: subscription.currentPeriodEnd,
        },
      },
    });
  })
);

/**
 * POST /api/subscriptions/reactivate
 * Reactivate cancelled subscription
 */
router.post(
  '/reactivate',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const subscription = subscriptions.find((s) => s.userId === req.user?.userId);

    if (!subscription) {
      throw new NotFoundError('Subscription');
    }

    if (!subscription.cancelAtPeriodEnd) {
      throw new ValidationError('Subscription is not set to cancel');
    }

    // Reactivate subscription
    subscription.cancelAtPeriodEnd = false;
    subscription.updatedAt = new Date();

    res.json({
      success: true,
      message: 'Subscription reactivated successfully',
      data: {
        subscription: {
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          currentPeriodEnd: subscription.currentPeriodEnd,
        },
      },
    });
  })
);

/**
 * GET /api/subscriptions/usage
 * Get subscription usage statistics
 */
router.get(
  '/usage',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const subscription = subscriptions.find((s) => s.userId === req.user?.userId);

    if (!subscription) {
      res.json({
        success: true,
        data: {
          usage: {
            generationsUsed: 0,
            generationsLimit: 3,
            generationsRemaining: 3,
            resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      });
      return;
    }

    const generationsRemaining =
      subscription.generationsLimit === -1
        ? 'unlimited'
        : subscription.generationsLimit - subscription.generationsUsed;

    res.json({
      success: true,
      data: {
        usage: {
          generationsUsed: subscription.generationsUsed,
          generationsLimit: subscription.generationsLimit === -1 ? 'unlimited' : subscription.generationsLimit,
          generationsRemaining,
          resetDate: subscription.currentPeriodEnd,
        },
      },
    });
  })
);

/**
 * POST /api/subscriptions/use-generation
 * Track music generation usage
 */
router.post(
  '/use-generation',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    let subscription = subscriptions.find((s) => s.userId === req.user?.userId);

    // If no subscription, create free tier subscription
    if (!subscription) {
      const now = new Date();
      subscription = {
        userId: req.user!.userId,
        planId: 'free',
        status: 'active',
        generationsUsed: 0,
        generationsLimit: 3,
        currentPeriodStart: now,
        currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
        createdAt: now,
        updatedAt: now,
      };
      subscriptions.push(subscription);
    }

    // Check if user has generations left
    if (
      subscription.generationsLimit !== -1 &&
      subscription.generationsUsed >= subscription.generationsLimit
    ) {
      return res.status(402).json({
        success: false,
        error: {
          message: 'Generation limit reached. Please upgrade to premium.',
          statusCode: 402,
          code: 'GENERATION_LIMIT_REACHED',
        },
      });
    }

    // Increment usage
    subscription.generationsUsed++;
    subscription.updatedAt = new Date();

    const generationsRemaining =
      subscription.generationsLimit === -1
        ? 'unlimited'
        : subscription.generationsLimit - subscription.generationsUsed;

    res.json({
      success: true,
      data: {
        generationsUsed: subscription.generationsUsed,
        generationsRemaining,
      },
    });
  })
);

export { router as subscriptionRouter };
