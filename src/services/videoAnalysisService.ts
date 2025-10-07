import axios from 'axios';
import * as fal from '@fal-ai/serverless-client';
import { VideoAnalysis } from '../types';

const FAL_API_URL = 'https://fal.run/fal-ai';
const API_KEY = process.env.EXPO_PUBLIC_FAL_API_KEY;

// Configure Fal.ai client
if (API_KEY) {
  fal.config({
    credentials: API_KEY,
  });
}

export interface AnalysisProgress {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
}

export class VideoAnalysisService {
  private apiClient = axios.create({
    baseURL: FAL_API_URL,
    headers: {
      'Authorization': `Key ${API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  async analyzeVideo(
    videoUri: string,
    onProgress?: (progress: AnalysisProgress) => void
  ): Promise<VideoAnalysis> {
    try {
      if (!API_KEY) {
        console.warn('Fal.ai API key not found, using mock data');
        return this.getMockAnalysisWithProgress(onProgress);
      }

      // For now, return mock data with progress updates
      // TODO: Implement actual Fal.ai API integration when:
      // 1. Video is uploaded to cloud storage (Firebase/AWS S3)
      // 2. Cloud storage URL is available
      // 3. Appropriate Fal.ai model is selected
      return this.getMockAnalysisWithProgress(onProgress);
    } catch (error) {
      console.error('Video analysis failed:', error);
      onProgress?.({
        status: 'failed',
        progress: 0,
        message: 'Analysis failed. Please try again.',
      });
      throw new Error('Failed to analyze video');
    }
  }

  private async getMockAnalysisWithProgress(
    onProgress?: (progress: AnalysisProgress) => void
  ): Promise<VideoAnalysis> {
    // Simulate analysis progress
    onProgress?.({
      status: 'processing',
      progress: 20,
      message: 'Preparing video for analysis...',
    });
    await new Promise(resolve => setTimeout(resolve, 1000));

    onProgress?.({
      status: 'processing',
      progress: 50,
      message: 'Analyzing video content...',
    });
    await new Promise(resolve => setTimeout(resolve, 1500));

    onProgress?.({
      status: 'processing',
      progress: 80,
      message: 'Extracting audio features...',
    });
    await new Promise(resolve => setTimeout(resolve, 1000));

    const analysis = this.getMockAnalysis();

    onProgress?.({
      status: 'completed',
      progress: 100,
      message: 'Analysis complete!',
    });

    return analysis;
  }

  private getMockAnalysis(): VideoAnalysis {
    const moods: VideoAnalysis['mood'][] = ['energetic', 'calm', 'dramatic', 'upbeat', 'melancholic', 'mysterious'];

    return {
      bpm: 120 + Math.floor(Math.random() * 60), // 120-180 BPM
      mood: moods[Math.floor(Math.random() * moods.length)],
      intensity: Math.random(),
      duration: 30 + Math.floor(Math.random() * 30), // 30-60 seconds
      sceneChanges: this.generateSceneChanges(),
    };
  }

  private generateSceneChanges(): number[] {
    const changes: number[] = [];
    const numChanges = 3 + Math.floor(Math.random() * 5); // 3-7 scene changes

    for (let i = 0; i < numChanges; i++) {
      changes.push(Math.random() * 60); // Random timestamp within 60 seconds
    }

    return changes.sort();
  }

  private parseAnalysisResponse(data: any): VideoAnalysis {
    return {
      bpm: data.audio_features?.tempo || 120,
      mood: this.interpretMood(data.emotional_analysis?.dominant_emotion),
      intensity: data.visual_analysis?.average_intensity || 0.5,
      duration: data.metadata?.duration || 30,
      sceneChanges: data.visual_analysis?.scene_changes || [],
    };
  }

  private interpretMood(emotion: string): VideoAnalysis['mood'] {
    const moodMap: Record<string, VideoAnalysis['mood']> = {
      'happy': 'upbeat',
      'excited': 'energetic',
      'sad': 'melancholic',
      'peaceful': 'calm',
      'intense': 'dramatic',
      'mysterious': 'mysterious',
    };

    return moodMap[emotion?.toLowerCase()] || 'upbeat';
  }

  /**
   * Generate music prompt based on video analysis
   */
  generateMusicPrompt(analysis: VideoAnalysis, customPrompt?: string): string {
    const { bpm, mood, intensity } = analysis;
    const prompts: string[] = [];

    if (customPrompt) {
      prompts.push(customPrompt);
    }

    if (mood) {
      prompts.push(`${mood} mood`);
    }

    if (bpm) {
      const tempo = this.getTempoFromBPM(bpm);
      prompts.push(`${tempo} tempo (${bpm} BPM)`);
    }

    if (intensity !== undefined) {
      const intensityLevel = this.getIntensityLevel(intensity);
      prompts.push(`${intensityLevel} intensity`);
    }

    return prompts.join(', ');
  }

  /**
   * Get tempo description from BPM
   */
  private getTempoFromBPM(bpm: number): string {
    if (bpm < 90) return 'slow';
    if (bpm < 120) return 'moderate';
    if (bpm < 140) return 'medium';
    if (bpm < 160) return 'fast';
    return 'very fast';
  }

  /**
   * Get intensity level from 0-1 scale
   */
  private getIntensityLevel(intensity: number): string {
    if (intensity < 0.3) return 'low';
    if (intensity < 0.7) return 'medium';
    return 'high';
  }

  /**
   * Get recommended music styles based on analysis
   */
  getRecommendedStyles(analysis: VideoAnalysis): string[] {
    const { mood, intensity } = analysis;
    const styles: string[] = [];

    // Mood-based recommendations
    switch (mood) {
      case 'energetic':
      case 'upbeat':
        styles.push('Pop', 'Dance', 'Electronic', 'EDM');
        break;
      case 'calm':
        styles.push('Ambient', 'Lo-fi', 'Piano', 'Acoustic');
        break;
      case 'dramatic':
        styles.push('Cinematic', 'Orchestral', 'Epic');
        break;
      case 'melancholic':
        styles.push('Sad Piano', 'Emotional', 'Ballad');
        break;
      case 'mysterious':
        styles.push('Dark', 'Suspense', 'Atmospheric');
        break;
    }

    // Intensity-based recommendations
    if (intensity > 0.7) {
      styles.push('Rock', 'Hip Hop', 'Trap');
    } else if (intensity < 0.3) {
      styles.push('Jazz', 'Classical', 'Meditation');
    }

    // Remove duplicates and return top 6
    return [...new Set(styles)].slice(0, 6);
  }
}