import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoAnalysis, GeneratedMusic } from '../types';
import { VideoAnalysisService, AnalysisProgress } from '../services/videoAnalysisService';
import { MusicGenerationService, MusicGenerationProgress } from '../services/musicGenerationService';
import { HistoryService } from '../services/historyService';
import CustomAlert from '../components/CustomAlert';

type MusicGenerationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MusicGeneration'
>;

type MusicGenerationScreenRouteProp = RouteProp<
  RootStackParamList,
  'MusicGeneration'
>;

interface Props {
  navigation: MusicGenerationScreenNavigationProp;
  route: MusicGenerationScreenRouteProp;
}

const generationSteps = [
  {
    id: 1,
    title: 'Analyzing Video',
    description: 'Extracting tempo, mood, and scene dynamics',
    icon: 'analytics',
  },
  {
    id: 2,
    title: 'Processing Audio Features',
    description: 'Understanding video rhythm and intensity',
    icon: 'pulse',
  },
  {
    id: 3,
    title: 'Generating Music',
    description: 'Creating your custom soundtrack',
    icon: 'musical-notes',
  },
  {
    id: 4,
    title: 'Finalizing Track',
    description: 'Applying finishing touches',
    icon: 'checkmark-circle',
  },
];

export default function MusicGenerationScreen({ navigation, route }: Props) {
  const { videoUri, prompt } = route.params;
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [videoAnalysis, setVideoAnalysis] = useState<VideoAnalysis | null>(null);
  const [generatedMusic, setGeneratedMusic] = useState<GeneratedMusic | null>(null);
  const [analysisMessage, setAnalysisMessage] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ type: 'error' as const, title: '', message: '' });

  const videoAnalysisService = new VideoAnalysisService();
  const musicGenerationService = new MusicGenerationService();
  const historyService = new HistoryService();

  useEffect(() => {
    generateMusic();
  }, []);

  const generateMusic = async () => {
    try {
      // Step 1: Analyze Video
      setCurrentStep(0);
      setProgress(0.1);

      const analysis = await videoAnalysisService.analyzeVideo(
        videoUri,
        (analysisProgress: AnalysisProgress) => {
          setAnalysisMessage(analysisProgress.message);
          // Map analysis progress (0-100) to our progress range (0.1-0.3)
          const mappedProgress = 0.1 + (analysisProgress.progress / 100) * 0.2;
          setProgress(mappedProgress);

          if (analysisProgress.status === 'completed') {
            setCurrentStep(1);
          }
        }
      );

      setVideoAnalysis(analysis);
      setProgress(0.3);

      // Step 2: Process Audio Features
      setCurrentStep(1);
      setAnalysisMessage('Understanding video rhythm and intensity...');
      await simulateDelay(1500);
      setProgress(0.5);

      // Step 3: Generate Music
      setCurrentStep(2);
      setAnalysisMessage('Creating your custom soundtrack...');
      const music = await musicGenerationService.generateMusic(
        analysis,
        prompt,
        (musicProgress: MusicGenerationProgress) => {
          setAnalysisMessage(musicProgress.message);
          // Map music generation progress (0-100) to our progress range (0.5-0.8)
          const mappedProgress = 0.5 + (musicProgress.progress / 100) * 0.3;
          setProgress(mappedProgress);
        }
      );
      setGeneratedMusic(music);
      setProgress(0.8);

      // Step 4: Finalize
      setCurrentStep(3);
      setAnalysisMessage('Applying finishing touches...');
      await simulateDelay(1000);
      setProgress(1.0);

      // Save to history
      await historyService.saveGeneration(videoUri, music, analysis);

      // Navigate to preview screen
      setTimeout(() => {
        navigation.replace('Preview', {
          videoUri,
          audioUri: music.audioUri,
        });
      }, 1000);

    } catch (error) {
      console.error('Music generation failed:', error);
      setAlertConfig({
        type: 'error',
        title: 'Generation Failed',
        message: 'We couldn\'t generate music for your video. Please try again.',
      });
      setAlertVisible(true);
    }
  };


  const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const currentStepData = generationSteps[currentStep];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#4A5B3A', '#2A1A3E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Generating Your Soundtrack</Text>
              <Text style={styles.subtitle}>
                {analysisMessage || 'This usually takes 10-20 seconds'}
              </Text>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
            </View>

            <View style={styles.stepsContainer}>
              {generationSteps.map((step, index) => (
                <View key={step.id} style={styles.stepItem}>
                  <View style={[
                    styles.stepIcon,
                    {
                      backgroundColor: index <= currentStep ? '#A855F7' : 'rgba(255, 255, 255, 0.1)',
                    }
                  ]}>
                    {index < currentStep ? (
                      <Ionicons name="checkmark" size={18} color="white" />
                    ) : index === currentStep ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Ionicons name={step.icon as any} size={18} color="rgba(255, 255, 255, 0.5)" />
                    )}
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={[
                      styles.stepTitle,
                      { color: index <= currentStep ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)' }
                    ]}>
                      {step.title}
                    </Text>
                    <Text style={styles.stepDescription}>
                      {step.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {videoAnalysis && (
              <View style={styles.analysisContainer}>
                <Text style={styles.analysisTitle}>Video Analysis</Text>
                <View style={styles.analysisGrid}>
                  <View style={styles.analysisItem}>
                    <Text style={styles.analysisLabel}>BPM</Text>
                    <Text style={styles.analysisValue}>{videoAnalysis.bpm}</Text>
                  </View>
                  <View style={styles.analysisItem}>
                    <Text style={styles.analysisLabel}>Mood</Text>
                    <Text style={styles.analysisValue}>{videoAnalysis.mood}</Text>
                  </View>
                  <View style={styles.analysisItem}>
                    <Text style={styles.analysisLabel}>Intensity</Text>
                    <Text style={styles.analysisValue}>
                      {Math.round(videoAnalysis.intensity * 100)}%
                    </Text>
                  </View>
                  <View style={styles.analysisItem}>
                    <Text style={styles.analysisLabel}>Duration</Text>
                    <Text style={styles.analysisValue}>{videoAnalysis.duration}s</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <CustomAlert
        visible={alertVisible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => {
          setAlertVisible(false);
          navigation.goBack();
        }}
        buttons={[
          {
            text: 'Try Again',
            onPress: () => {
              setAlertVisible(false);
              generateMusic();
            },
          },
          {
            text: 'Go Back',
            style: 'cancel',
            onPress: () => {
              setAlertVisible(false);
              navigation.goBack();
            },
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    justifyContent: 'flex-start',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.7,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A855F7',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  stepsContainer: {
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  analysisContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  analysisTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  analysisItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 10,
  },
  analysisLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  analysisValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#A855F7',
    textTransform: 'capitalize',
  },
});