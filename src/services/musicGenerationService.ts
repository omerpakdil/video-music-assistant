import axios from 'axios';
import { VideoAnalysis, GeneratedMusic } from '../types';

const STABLE_AUDIO_API_URL = 'https://api.stableaudio.com/v1';
const API_KEY = process.env.EXPO_PUBLIC_STABLE_AUDIO_API_KEY;

export class MusicGenerationService {
  private apiClient = axios.create({
    baseURL: STABLE_AUDIO_API_URL,
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  async generateMusic(
    analysis: VideoAnalysis,
    stylePrompt?: string
  ): Promise<GeneratedMusic> {
    try {
      if (!API_KEY) {
        console.warn('Stable Audio API key not found, using mock data');
        return this.getMockGeneration(analysis, stylePrompt);
      }

      const prompt = this.buildPrompt(analysis, stylePrompt);

      // Actual API call would look like this:
      /*
      const response = await this.apiClient.post('/generate', {
        prompt,
        duration: analysis.duration,
        cfg_scale: 7,
        steps: 50,
        seed: Math.floor(Math.random() * 1000000),
      });

      return this.parseGenerationResponse(response.data, analysis, stylePrompt);
      */

      // For now, return mock data
      return this.getMockGeneration(analysis, stylePrompt);
    } catch (error) {
      console.error('Music generation failed:', error);
      throw new Error('Failed to generate music');
    }
  }

  async generateVariation(
    originalMusic: GeneratedMusic,
    analysis: VideoAnalysis
  ): Promise<GeneratedMusic> {
    const variationPrompt = this.buildVariationPrompt(originalMusic.style);
    return this.generateMusic(analysis, variationPrompt);
  }

  private buildPrompt(analysis: VideoAnalysis, stylePrompt?: string): string {
    const baseParts = [
      `${analysis.bpm} BPM`,
      analysis.mood,
      `intensity ${Math.round(analysis.intensity * 10)}/10`,
    ];

    if (stylePrompt) {
      baseParts.unshift(stylePrompt);
    }

    const qualityDescriptors = [
      'high quality',
      'professional',
      'royalty-free',
      'instrumental',
    ];

    return [...baseParts, ...qualityDescriptors].join(', ');
  }

  private buildVariationPrompt(originalStyle: string): string {
    const variations = [
      'alternative arrangement',
      'different instrumentation',
      'remix version',
      'acoustic version',
      'electronic version',
    ];

    const variation = variations[Math.floor(Math.random() * variations.length)];
    return `${originalStyle}, ${variation}`;
  }

  private getMockGeneration(
    analysis: VideoAnalysis,
    stylePrompt?: string
  ): GeneratedMusic {
    const keys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const styles = stylePrompt?.split(',')[0] || analysis.mood;

    return {
      audioUri: this.generateMockAudioUri(),
      title: `${analysis.mood} ${stylePrompt || 'Track'}`,
      style: styles,
      duration: analysis.duration,
      metadata: {
        bpm: analysis.bpm,
        key: keys[Math.floor(Math.random() * keys.length)],
        mood: analysis.mood,
      },
    };
  }

  private generateMockAudioUri(): string {
    // In a real app, this would be the actual generated audio file URL
    // For demo purposes, we'll use a placeholder or sample audio file
    return `mock_audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp3`;
  }

  private parseGenerationResponse(
    data: any,
    analysis: VideoAnalysis,
    stylePrompt?: string
  ): GeneratedMusic {
    return {
      audioUri: data.audio_url || this.generateMockAudioUri(),
      title: stylePrompt || `${analysis.mood} Track`,
      style: stylePrompt || analysis.mood,
      duration: analysis.duration,
      metadata: {
        bpm: analysis.bpm,
        key: data.metadata?.key || 'C',
        mood: analysis.mood,
      },
    };
  }

  // Utility method to check service availability
  async checkServiceHealth(): Promise<boolean> {
    try {
      if (!API_KEY) {
        return false;
      }

      // In production, this would ping the actual API
      /*
      const response = await this.apiClient.get('/health');
      return response.status === 200;
      */

      return true;
    } catch {
      return false;
    }
  }
}