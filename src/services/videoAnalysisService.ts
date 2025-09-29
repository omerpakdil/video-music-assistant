import axios from 'axios';
import { VideoAnalysis } from '../types';

const FAL_API_URL = 'https://fal.run/fal-ai';
const API_KEY = process.env.EXPO_PUBLIC_FAL_API_KEY;

export class VideoAnalysisService {
  private apiClient = axios.create({
    baseURL: FAL_API_URL,
    headers: {
      'Authorization': `Key ${API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  async analyzeVideo(videoUri: string): Promise<VideoAnalysis> {
    try {
      // For demo purposes, we'll simulate the API call
      // In production, this would call the actual Fal.ai API

      if (!API_KEY) {
        console.warn('Fal.ai API key not found, using mock data');
        return this.getMockAnalysis();
      }

      // Actual API call would look like this:
      /*
      const response = await this.apiClient.post('/video-analysis', {
        video_url: videoUri,
        features: ['tempo', 'mood', 'intensity', 'scene_changes']
      });

      return this.parseAnalysisResponse(response.data);
      */

      // For now, return mock data
      return this.getMockAnalysis();
    } catch (error) {
      console.error('Video analysis failed:', error);
      throw new Error('Failed to analyze video');
    }
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
}