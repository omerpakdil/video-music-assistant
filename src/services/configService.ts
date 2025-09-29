import Constants from 'expo-constants';

export class ConfigService {
  static get falApiKey(): string {
    return Constants.expoConfig?.extra?.FAL_API_KEY || process.env.EXPO_PUBLIC_FAL_API_KEY || '';
  }

  static get stableAudioApiKey(): string {
    return Constants.expoConfig?.extra?.STABLE_AUDIO_API_KEY || process.env.EXPO_PUBLIC_STABLE_AUDIO_API_KEY || '';
  }

  static get adaptyApiKey(): string {
    return Constants.expoConfig?.extra?.ADAPTY_API_KEY || process.env.EXPO_PUBLIC_ADAPTY_API_KEY || '';
  }

  static get apiBaseUrl(): string {
    return Constants.expoConfig?.extra?.API_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
  }

  static get isProduction(): boolean {
    return Constants.expoConfig?.extra?.NODE_ENV === 'production' || process.env.NODE_ENV === 'production';
  }

  static get isDevelopment(): boolean {
    return !this.isProduction;
  }

  static get firebase() {
    return {
      apiKey: Constants.expoConfig?.extra?.FIREBASE_API_KEY || process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
      authDomain: Constants.expoConfig?.extra?.FIREBASE_AUTH_DOMAIN || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      projectId: Constants.expoConfig?.extra?.FIREBASE_PROJECT_ID || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
      storageBucket: Constants.expoConfig?.extra?.FIREBASE_STORAGE_BUCKET || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    };
  }

  static get aws() {
    return {
      accessKeyId: Constants.expoConfig?.extra?.AWS_ACCESS_KEY_ID || process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID || '',
      secretAccessKey: Constants.expoConfig?.extra?.AWS_SECRET_ACCESS_KEY || process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
      region: Constants.expoConfig?.extra?.AWS_REGION || process.env.EXPO_PUBLIC_AWS_REGION || '',
      bucketName: Constants.expoConfig?.extra?.AWS_BUCKET_NAME || process.env.EXPO_PUBLIC_AWS_BUCKET_NAME || '',
    };
  }

  static validateConfiguration(): {
    isValid: boolean;
    missingKeys: string[];
  } {
    const requiredKeys = [
      { key: 'FAL_API_KEY', value: this.falApiKey },
      { key: 'STABLE_AUDIO_API_KEY', value: this.stableAudioApiKey },
    ];

    const missingKeys = requiredKeys
      .filter(({ value }) => !value)
      .map(({ key }) => key);

    return {
      isValid: missingKeys.length === 0,
      missingKeys,
    };
  }

  static logConfiguration(): void {
    if (this.isDevelopment) {
      console.log('App Configuration:');
      console.log('- Environment:', this.isProduction ? 'production' : 'development');
      console.log('- API Base URL:', this.apiBaseUrl);
      console.log('- Fal.ai API Key:', this.falApiKey ? 'configured' : 'missing');
      console.log('- Stable Audio API Key:', this.stableAudioApiKey ? 'configured' : 'missing');
      console.log('- Adapty API Key:', this.adaptyApiKey ? 'configured' : 'missing');

      const validation = this.validateConfiguration();
      if (!validation.isValid) {
        console.warn('Missing required configuration keys:', validation.missingKeys);
      }
    }
  }
}