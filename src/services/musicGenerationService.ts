import axios from 'axios';
import * as fal from '@fal-ai/serverless-client';
import { VideoAnalysis, GeneratedMusic } from '../types';

const API_KEY = process.env.EXPO_PUBLIC_FAL_API_KEY;

// Configure Fal.ai client
if (API_KEY) {
  fal.config({
    credentials: API_KEY,
  });
}

export interface MusicGenerationProgress {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
}

export class MusicGenerationService {
  // Available Fal.ai music models
  private readonly models = {
    stableAudio: 'fal-ai/stable-audio-25/text-to-audio',
    minimax: 'fal-ai/minimax-music',
    cassette: 'cassetteai/music-generator',
  };

  private apiClient = axios.create({
    headers: {
      'Authorization': `Key ${API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  async generateMusic(
    analysis: VideoAnalysis,
    stylePrompt?: string,
    onProgress?: (progress: MusicGenerationProgress) => void
  ): Promise<GeneratedMusic> {
    try {
      if (!API_KEY) {
        console.warn('Fal.ai API key not found, using mock data');
        return this.getMockGenerationWithProgress(analysis, stylePrompt, onProgress);
      }

      const prompt = this.buildPrompt(analysis, stylePrompt);

      onProgress?.({
        status: 'processing',
        progress: 10,
        message: 'Preparing music generation...',
      });

      // Use Fal.ai MiniMax Music model
      const result = await fal.subscribe(this.models.minimax, {
        input: {
          prompt: prompt,
          model: 'music',
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === 'IN_PROGRESS') {
            onProgress?.({
              status: 'processing',
              progress: 50,
              message: 'Generating music with MiniMax AI...',
            });
          }
        },
      });

      onProgress?.({
        status: 'completed',
        progress: 100,
        message: 'Music generation complete!',
      });

      return this.parseFalAiResponse(result.data, analysis, stylePrompt);
    } catch (error) {
      console.error('Music generation failed:', error);
      onProgress?.({
        status: 'failed',
        progress: 0,
        message: 'Music generation failed',
      });

      // Fallback to mock data on error
      console.warn('Falling back to mock data');
      return this.getMockGenerationWithProgress(analysis, stylePrompt, onProgress);
    }
  }

  private async getMockGenerationWithProgress(
    analysis: VideoAnalysis,
    stylePrompt?: string,
    onProgress?: (progress: MusicGenerationProgress) => void
  ): Promise<GeneratedMusic> {
    // Simulate generation progress
    onProgress?.({
      status: 'processing',
      progress: 20,
      message: 'Preparing music generation...',
    });
    await new Promise(resolve => setTimeout(resolve, 1000));

    onProgress?.({
      status: 'processing',
      progress: 50,
      message: 'Generating music...',
    });
    await new Promise(resolve => setTimeout(resolve, 2000));

    onProgress?.({
      status: 'processing',
      progress: 80,
      message: 'Finalizing track...',
    });
    await new Promise(resolve => setTimeout(resolve, 1000));

    const music = this.getMockGeneration(analysis, stylePrompt);

    onProgress?.({
      status: 'completed',
      progress: 100,
      message: 'Music generation complete!',
    });

    return music;
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

  private parseFalAiResponse(
    data: any,
    analysis: VideoAnalysis,
    stylePrompt?: string
  ): GeneratedMusic {
    // MiniMax Music response format
    return {
      audioUri: data.audio_file?.url || data.audio_url || this.generateMockAudioUri(),
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