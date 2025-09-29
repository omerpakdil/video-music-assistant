export interface VideoAnalysis {
  bpm: number;
  mood: 'energetic' | 'calm' | 'dramatic' | 'upbeat' | 'melancholic' | 'mysterious';
  intensity: number; // 0-1 scale
  duration: number; // in seconds
  sceneChanges: number[];
}

export interface MusicStyle {
  id: string;
  name: string;
  description: string;
  tags: string[];
}

export interface GeneratedMusic {
  audioUri: string;
  title: string;
  style: string;
  duration: number;
  metadata: {
    bpm: number;
    key: string;
    mood: string;
  };
}

export interface UserSubscription {
  isActive: boolean;
  plan: 'free' | 'premium';
  generationsLeft: number;
  expiresAt?: Date;
}

export interface ExportOptions {
  format: 'mp3' | 'wav';
  quality: 'standard' | 'high';
  includeVideo: boolean;
}

export interface VideoSource {
  type: 'upload' | 'url';
  uri: string;
  duration?: number;
  thumbnail?: string;
}