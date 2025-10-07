import AsyncStorage from '@react-native-async-storage/async-storage';
import { GeneratedMusic, VideoAnalysis } from '../types';

export interface GenerationHistoryItem {
  id: string;
  videoUri: string;
  audioUri: string;
  title: string;
  style: string;
  duration: number;
  createdAt: Date;
  isFavorite: boolean;
  videoAnalysis?: VideoAnalysis;
  metadata?: {
    bpm: number;
    key: string;
    mood: string;
  };
}

const HISTORY_STORAGE_KEY = '@video_music_assistant:generation_history';
const MAX_HISTORY_ITEMS = 50; // Keep last 50 generations

export class HistoryService {
  /**
   * Save a generation to history
   */
  async saveGeneration(
    videoUri: string,
    music: GeneratedMusic,
    analysis?: VideoAnalysis
  ): Promise<GenerationHistoryItem> {
    try {
      const historyItem: GenerationHistoryItem = {
        id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        videoUri,
        audioUri: music.audioUri,
        title: music.title,
        style: music.style,
        duration: music.duration,
        createdAt: new Date(),
        isFavorite: false,
        videoAnalysis: analysis,
        metadata: music.metadata,
      };

      const history = await this.getHistory();
      const updatedHistory = [historyItem, ...history].slice(0, MAX_HISTORY_ITEMS);

      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));

      return historyItem;
    } catch (error) {
      console.error('Error saving generation:', error);
      throw error;
    }
  }

  /**
   * Get all generation history
   */
  async getHistory(): Promise<GenerationHistoryItem[]> {
    try {
      const historyJson = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      if (!historyJson) return [];

      const history = JSON.parse(historyJson);
      // Convert date strings back to Date objects
      return history.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
      }));
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  }

  /**
   * Get a single generation by ID
   */
  async getGenerationById(id: string): Promise<GenerationHistoryItem | null> {
    try {
      const history = await this.getHistory();
      return history.find(item => item.id === id) || null;
    } catch (error) {
      console.error('Error getting generation by ID:', error);
      return null;
    }
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(id: string): Promise<boolean> {
    try {
      const history = await this.getHistory();
      const updatedHistory = history.map(item =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      );

      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));

      const item = updatedHistory.find(i => i.id === id);
      return item?.isFavorite || false;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  /**
   * Delete a generation
   */
  async deleteGeneration(id: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const updatedHistory = history.filter(item => item.id !== id);

      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error deleting generation:', error);
      throw error;
    }
  }

  /**
   * Get favorites
   */
  async getFavorites(): Promise<GenerationHistoryItem[]> {
    try {
      const history = await this.getHistory();
      return history.filter(item => item.isFavorite);
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  /**
   * Search generations
   */
  async searchGenerations(query: string): Promise<GenerationHistoryItem[]> {
    try {
      const history = await this.getHistory();
      const lowerQuery = query.toLowerCase();

      return history.filter(
        item =>
          item.title.toLowerCase().includes(lowerQuery) ||
          item.style.toLowerCase().includes(lowerQuery) ||
          item.metadata?.mood.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('Error searching generations:', error);
      return [];
    }
  }

  /**
   * Filter by style/genre
   */
  async filterByStyle(style: string): Promise<GenerationHistoryItem[]> {
    try {
      const history = await this.getHistory();
      return history.filter(item =>
        item.style.toLowerCase().includes(style.toLowerCase())
      );
    } catch (error) {
      console.error('Error filtering by style:', error);
      return [];
    }
  }

  /**
   * Get recent generations (last 7 days)
   */
  async getRecentGenerations(): Promise<GenerationHistoryItem[]> {
    try {
      const history = await this.getHistory();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      return history.filter(item => item.createdAt > sevenDaysAgo);
    } catch (error) {
      console.error('Error getting recent generations:', error);
      return [];
    }
  }

  /**
   * Get statistics
   */
  async getStatistics(): Promise<{
    totalGenerations: number;
    totalFavorites: number;
    totalDuration: string;
    mostUsedStyle: string;
  }> {
    try {
      const history = await this.getHistory();

      const totalDurationSeconds = history.reduce((sum, item) => sum + item.duration, 0);
      const minutes = Math.floor(totalDurationSeconds / 60);
      const seconds = Math.floor(totalDurationSeconds % 60);

      // Find most used style
      const styleCounts: Record<string, number> = {};
      history.forEach(item => {
        styleCounts[item.style] = (styleCounts[item.style] || 0) + 1;
      });
      const mostUsedStyle = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

      return {
        totalGenerations: history.length,
        totalFavorites: history.filter(item => item.isFavorite).length,
        totalDuration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        mostUsedStyle,
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        totalGenerations: 0,
        totalFavorites: 0,
        totalDuration: '0:00',
        mostUsedStyle: 'None',
      };
    }
  }

  /**
   * Clear all history
   */
  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing history:', error);
      throw error;
    }
  }

  /**
   * Format relative time
   */
  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffSeconds < 60) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffWeeks === 1) return '1 week ago';
    if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
    if (diffMonths === 1) return '1 month ago';
    return `${diffMonths} months ago`;
  }
}
