import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService, { User, LoginCredentials, RegisterCredentials } from '../services/authService';

const TOKEN_KEY = '@video_music_assistant_token';
const USER_KEY = '@video_music_assistant_user';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Load token and user from AsyncStorage on app start
   */
  useEffect(() => {
    loadStoredAuth();
  }, []);

  /**
   * Load stored authentication data
   */
  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      if (storedToken && storedUser) {
        const parsedUser: User = JSON.parse(storedUser);

        // Set token in auth service
        authService.setToken(storedToken);

        // Validate token by fetching fresh profile
        try {
          const freshUser = await authService.getProfile();
          setUser(freshUser);
          setToken(storedToken);

          // Update stored user with fresh data
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(freshUser));
        } catch (error) {
          // Token is invalid or user doesn't exist, clear storage silently
          // This can happen when backend restarts (in-memory storage) or token expires
          await clearAuth();
        }
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
      await clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save token and user to AsyncStorage
   */
  const saveAuth = async (newToken: string, newUser: User) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, newToken),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser)),
      ]);
    } catch (error) {
      console.error('Failed to save auth:', error);
      throw new Error('Failed to save authentication data');
    }
  };

  /**
   * Clear token and user from AsyncStorage
   */
  const clearAuth = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY),
      ]);
      setUser(null);
      setToken(null);
      authService.setToken(null);
    } catch (error) {
      console.error('Failed to clear auth:', error);
    }
  };

  /**
   * Login user
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);

      setUser(response.user);
      setToken(response.token);

      await saveAuth(response.token, response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (credentials: RegisterCredentials) => {
    try {
      setIsLoading(true);
      const response = await authService.register(credentials);

      setUser(response.user);
      setToken(response.token);

      await saveAuth(response.token, response.user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      authService.logout();
      await clearAuth();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update user in state and storage
   */
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser)).catch((error) => {
      console.error('Failed to update stored user:', error);
    });
  };

  /**
   * Refresh user profile from server
   */
  const refreshProfile = async () => {
    try {
      if (!token) {
        throw new Error('Not authenticated');
      }

      const freshUser = await authService.getProfile();
      updateUser(freshUser);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: user !== null && token !== null,
    login,
    register,
    logout,
    updateUser,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
