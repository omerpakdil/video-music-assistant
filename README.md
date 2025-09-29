# Video Music Assistant

An AI-powered React Native mobile app that generates royalty-free soundtracks for short-form videos, solving copyright issues for content creators on TikTok, Instagram Reels, and YouTube Shorts.

## Features

- **Video Upload & Analysis**: Upload videos or paste TikTok/YouTube links
- **AI-Powered Music Generation**: Custom soundtracks based on video analysis
- **Copyright-Free Music**: 100% royalty-free tracks with commercial licensing
- **Multiple Export Options**: MP3, WAV, with or without video
- **Style Customization**: Choose from various music styles or use custom prompts
- **Instant Preview**: Watch your video with the generated soundtrack
- **Subscription Management**: Free tier with premium upgrades

## Tech Stack

### Frontend (React Native/Expo)
- **React Native** with Expo for cross-platform mobile development
- **React Navigation** for navigation between screens
- **Expo AV** for video and audio playback
- **TypeScript** for type safety

### APIs & Services
- **Fal.ai** for video analysis (tempo, mood, scene dynamics)
- **Stable Audio** for AI music generation
- **Adapty** for subscription management
- **Firebase/AWS S3** for file storage

### Core Libraries
```json
{
  "@react-navigation/native": "^7.1.17",
  "@react-navigation/stack": "^7.4.8",
  "@react-navigation/bottom-tabs": "^7.4.7",
  "expo-av": "^16.0.7",
  "expo-file-system": "^19.0.15",
  "expo-media-library": "^18.2.0",
  "expo-document-picker": "^14.0.7",
  "react-native-adapty": "^3.11.1",
  "axios": "^1.12.2"
}
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator or Android Emulator
- API keys for Fal.ai and Stable Audio

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/video-music-assistant.git
cd video-music-assistant
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your API keys:
```env
EXPO_PUBLIC_FAL_API_KEY=your_fal_ai_api_key_here
EXPO_PUBLIC_STABLE_AUDIO_API_KEY=your_stable_audio_api_key_here
EXPO_PUBLIC_ADAPTY_API_KEY=your_adapty_api_key_here
```

4. **Start the development server**
```bash
npm start
```

5. **Run on device/simulator**
```bash
# iOS
npm run ios

# Android
npm run android

# Web (for testing)
npm run web
```

## Project Structure

```
src/
├── components/         # Reusable UI components
├── navigation/         # Navigation configuration
│   └── AppNavigator.tsx
├── screens/           # Screen components
│   ├── OnboardingScreen.tsx
│   ├── HomeScreen.tsx
│   ├── VideoUploadScreen.tsx
│   ├── MusicGenerationScreen.tsx
│   ├── PreviewScreen.tsx
│   └── SettingsScreen.tsx
├── services/          # API and business logic
│   ├── videoAnalysisService.ts
│   ├── musicGenerationService.ts
│   ├── exportService.ts
│   └── configService.ts
├── types/             # TypeScript type definitions
│   └── index.ts
└── utils/             # Utility functions
```

## User Flow

1. **Onboarding**: Welcome screens explaining the app's features
2. **Video Input**: Upload video file or paste TikTok/YouTube URL
3. **Style Selection**: Choose music style or provide custom prompt
4. **AI Analysis**: Fal.ai analyzes video for tempo, mood, and dynamics
5. **Music Generation**: Stable Audio creates custom soundtrack
6. **Preview**: Watch video with generated music
7. **Export**: Download audio or video with soundtrack

## API Integration

### Video Analysis (Fal.ai)
```typescript
const analysis = await videoAnalysisService.analyzeVideo(videoUri);
// Returns: { bpm, mood, intensity, duration, sceneChanges }
```

### Music Generation (Stable Audio)
```typescript
const music = await musicGenerationService.generateMusic(analysis, prompt);
// Returns: { audioUri, title, style, duration, metadata }
```

### Export Service
```typescript
// Export audio only
const audioUri = await exportService.exportAudio(audioUri, options);

// Export video with soundtrack
const videoUri = await exportService.exportVideoWithAudio(videoUri, audioUri, options);
```

## Configuration

The app uses a centralized configuration service:

```typescript
import { ConfigService } from './src/services/configService';

// Check if all required API keys are configured
const { isValid, missingKeys } = ConfigService.validateConfiguration();

// Log configuration status in development
ConfigService.logConfiguration();
```

## Development Notes

### Mock Data
When API keys are not configured, the app falls back to mock data for development and testing.

### File Permissions
The app requests media library permissions for saving exported files:
- iOS: Requires `NSPhotoLibraryAddUsageDescription` in Info.plist
- Android: Requires `WRITE_EXTERNAL_STORAGE` permission

### Performance Considerations
- Video analysis is performed server-side to reduce device load
- Audio files are cached locally for preview
- Export operations are optimized for mobile storage

## Subscription Model

### Free Tier
- 3 music generations per month
- Standard quality exports
- MP3 format only

### Premium Tier
- Unlimited music generations
- High-quality WAV exports
- Commercial licensing
- Multiple style variations
- Priority processing

## Deployment

### Expo Build
```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### App Store Submission
- Configure app icons and splash screens
- Set up app store metadata
- Submit for review

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@videomusicassistant.com or create an issue on GitHub.

## Roadmap

- [ ] Real-time collaboration features
- [ ] Advanced audio effects and filters
- [ ] Integration with more video platforms
- [ ] AI-powered lyric generation
- [ ] Batch processing for multiple videos
- [ ] Desktop app version