import axios, { AxiosInstance } from 'axios';
import { ConfigService } from './configService';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  subscription: 'free' | 'premium';
  generationsLeft: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export class AuthService {
  private static instance: AuthService;
  private apiClient: AxiosInstance;
  private token: string | null = null;

  private constructor() {
    this.apiClient = axios.create({
      baseURL: ConfigService.apiBaseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.apiClient.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          // Server responded with error
          const message = error.response.data?.error?.message || 'An error occurred';
          throw new Error(message);
        } else if (error.request) {
          // Request made but no response
          throw new Error('Network error. Please check your connection.');
        } else {
          // Something else happened
          throw new Error(error.message || 'An unexpected error occurred');
        }
      }
    );
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Set authentication token
   */
  setToken(token: string | null): void {
    this.token = token;
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Register a new user
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await this.apiClient.post<{ success: boolean; data: AuthResponse }>(
        '/users/register',
        credentials
      );

      if (response.data.success) {
        this.token = response.data.data.token;
        return response.data.data;
      }

      throw new Error('Registration failed');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.apiClient.post<{ success: boolean; data: AuthResponse }>(
        '/users/login',
        credentials
      );

      if (response.data.success) {
        this.token = response.data.data.token;
        return response.data.data;
      }

      throw new Error('Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    try {
      const response = await this.apiClient.get<{ success: boolean; data: { user: User } }>(
        '/users/me'
      );

      if (response.data.success) {
        return response.data.data.user;
      }

      throw new Error('Failed to get profile');
    } catch (error) {
      // Silently fail - this is expected when token is invalid or backend restarted
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    try {
      const response = await this.apiClient.put<{ success: boolean; data: { user: User } }>(
        '/users/me',
        data
      );

      if (response.data.success) {
        return response.data.data.user;
      }

      throw new Error('Failed to update profile');
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      const response = await this.apiClient.post<{ success: boolean; message: string }>(
        '/users/change-password',
        data
      );

      if (!response.data.success) {
        throw new Error('Failed to change password');
      }
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<void> {
    try {
      const response = await this.apiClient.delete<{ success: boolean; message: string }>(
        '/users/me'
      );

      if (response.data.success) {
        this.token = null;
      } else {
        throw new Error('Failed to delete account');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    this.token = null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.token !== null;
  }

  /**
   * Validate token by fetching profile
   */
  async validateToken(): Promise<boolean> {
    try {
      if (!this.token) {
        return false;
      }

      await this.getProfile();
      return true;
    } catch (error) {
      this.token = null;
      return false;
    }
  }
}

export default AuthService.getInstance();
