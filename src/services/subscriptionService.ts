import { adapty } from 'react-native-adapty';
import { ConfigService } from './configService';
import { UserSubscription } from '../types';

/**
 * Subscription Service using Adapty SDK
 * Handles subscription management, paywalls, and product purchases
 */
export class SubscriptionService {
  private static instance: SubscriptionService;
  private isInitialized: boolean = false;

  private constructor() {}

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  /**
   * Initialize Adapty SDK
   */
  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) {
        return;
      }

      const apiKey = ConfigService.adaptyApiKey;
      if (!apiKey) {
        console.warn('Adapty API key not configured, using mock mode');
        this.isInitialized = true;
        return;
      }

      await adapty.activate(apiKey, {
        logLevel: ConfigService.isDevelopment ? 'verbose' : 'error',
      });

      this.isInitialized = true;
      console.log('Adapty SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Adapty:', error);
      throw new Error('Failed to initialize subscription service');
    }
  }

  /**
   * Identify user in Adapty
   */
  async identifyUser(userId: string): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (ConfigService.adaptyApiKey) {
        await adapty.identify(userId);
      }
    } catch (error) {
      console.error('Failed to identify user:', error);
    }
  }

  /**
   * Get user subscription status
   */
  async getSubscription(): Promise<UserSubscription> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!ConfigService.adaptyApiKey) {
        return this.getMockSubscription();
      }

      const profile = await adapty.getProfile();
      const isPremium = profile.accessLevels?.premium?.isActive || false;

      return {
        isActive: isPremium,
        plan: isPremium ? 'premium' : 'free',
        generationsLeft: isPremium ? -1 : 3, // -1 means unlimited
        expiresAt: profile.accessLevels?.premium?.expiresAt
          ? new Date(profile.accessLevels.premium.expiresAt)
          : undefined,
      };
    } catch (error) {
      console.error('Failed to get subscription:', error);
      return this.getMockSubscription();
    }
  }

  /**
   * Get available products
   */
  async getProducts(): Promise<any[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!ConfigService.adaptyApiKey) {
        return this.getMockProducts();
      }

      const paywall = await adapty.getPaywall('default');
      const products = await adapty.getPaywallProducts(paywall);

      return products;
    } catch (error) {
      console.error('Failed to get products:', error);
      return this.getMockProducts();
    }
  }

  /**
   * Purchase a product
   */
  async purchaseProduct(product: any): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!ConfigService.adaptyApiKey) {
        console.log('Mock purchase successful');
        return true;
      }

      const profile = await adapty.makePurchase(product);
      const isPremium = profile.accessLevels?.premium?.isActive || false;

      return isPremium;
    } catch (error) {
      console.error('Purchase failed:', error);
      throw new Error('Failed to complete purchase');
    }
  }

  /**
   * Restore purchases
   */
  async restorePurchases(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!ConfigService.adaptyApiKey) {
        console.log('Mock restore successful');
        return true;
      }

      const profile = await adapty.restorePurchases();
      const isPremium = profile.accessLevels?.premium?.isActive || false;

      return isPremium;
    } catch (error) {
      console.error('Restore failed:', error);
      throw new Error('Failed to restore purchases');
    }
  }

  /**
   * Get paywall configuration
   */
  async getPaywall(placement: string = 'default'): Promise<any> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!ConfigService.adaptyApiKey) {
        return this.getMockPaywall();
      }

      const paywall = await adapty.getPaywall(placement);
      return paywall;
    } catch (error) {
      console.error('Failed to get paywall:', error);
      return this.getMockPaywall();
    }
  }

  /**
   * Check if user has premium access
   */
  async hasPremiumAccess(): Promise<boolean> {
    try {
      const subscription = await this.getSubscription();
      return subscription.plan === 'premium' && subscription.isActive;
    } catch (error) {
      console.error('Failed to check premium access:', error);
      return false;
    }
  }

  /**
   * Track generation usage
   */
  async trackGenerationUsage(): Promise<{ allowed: boolean; remaining: number }> {
    try {
      const subscription = await this.getSubscription();

      // Premium users have unlimited generations
      if (subscription.plan === 'premium' && subscription.isActive) {
        return { allowed: true, remaining: -1 };
      }

      // Free users have limited generations
      const remaining = subscription.generationsLeft || 0;
      const allowed = remaining > 0;

      return { allowed, remaining };
    } catch (error) {
      console.error('Failed to track usage:', error);
      return { allowed: false, remaining: 0 };
    }
  }

  /**
   * Update custom attributes
   */
  async updateUserAttributes(attributes: Record<string, any>): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (ConfigService.adaptyApiKey) {
        await adapty.updateProfile({
          customAttributes: attributes,
        });
      }
    } catch (error) {
      console.error('Failed to update attributes:', error);
    }
  }

  /**
   * Log out user from Adapty
   */
  async logout(): Promise<void> {
    try {
      if (ConfigService.adaptyApiKey) {
        await adapty.logout();
      }
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  }

  // Mock data for development
  private getMockSubscription(): UserSubscription {
    return {
      isActive: false,
      plan: 'free',
      generationsLeft: 3,
    };
  }

  private getMockProducts(): any[] {
    return [
      {
        vendorProductId: 'premium_monthly',
        localizedTitle: 'Premium Monthly',
        localizedDescription: 'Unlimited music generations with premium features',
        price: '9.99',
        currencyCode: 'USD',
        currencySymbol: '$',
        subscriptionPeriod: 'P1M',
      },
      {
        vendorProductId: 'premium_yearly',
        localizedTitle: 'Premium Yearly',
        localizedDescription: 'Unlimited music generations with premium features (Save 16%)',
        price: '99.99',
        currencyCode: 'USD',
        currencySymbol: '$',
        subscriptionPeriod: 'P1Y',
      },
    ];
  }

  private getMockPaywall(): any {
    return {
      developerId: 'default',
      variationId: 'mock_variation',
      revision: 1,
      products: this.getMockProducts(),
    };
  }
}

export default SubscriptionService.getInstance();
