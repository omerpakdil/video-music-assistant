import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Slider,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, Audio, AVPlaybackStatus } from 'expo-av';
import { ExportOptions } from '../types';
import { ExportService } from '../services/exportService';
import CustomAlert from '../components/CustomAlert';

type PreviewScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Preview'
>;

type PreviewScreenRouteProp = RouteProp<RootStackParamList, 'Preview'>;

interface Props {
  navigation: PreviewScreenNavigationProp;
  route: PreviewScreenRouteProp;
}

export default function PreviewScreen({ navigation, route }: Props) {
  const { videoUri, audioUri } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ type: 'success' as const, title: '', message: '' });
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'mp3',
    quality: 'standard',
    includeVideo: true,
  });

  const videoRef = useRef<Video>(null);
  const audioRef = useRef<Audio.Sound | null>(null);
  const exportService = new ExportService();

  useEffect(() => {
    setupAudio();
    return () => {
      cleanupAudio();
    };
  }, []);

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Load audio file
      if (audioUri && audioUri !== 'mock_audio') {
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: false }
        );
        audioRef.current = sound;

        // Get audio duration
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setDuration((status.durationMillis || 0) / 1000);
        }
      }
    } catch (error) {
      console.error('Error setting up audio:', error);
    }
  };

  const cleanupAudio = async () => {
    if (audioRef.current) {
      await audioRef.current.unloadAsync();
    }
  };

  const togglePlayback = async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        // Pause both video and audio
        await videoRef.current.pauseAsync();
        if (audioRef.current) {
          await audioRef.current.pauseAsync();
        }
        setIsPlaying(false);
      } else {
        // Play both video and audio in sync
        await videoRef.current.playAsync();
        if (audioRef.current) {
          await audioRef.current.playAsync();
        }
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const handleVideoStatusUpdate = async (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    setIsPlaying(status.isPlaying);
    setCurrentTime((status.positionMillis || 0) / 1000);

    // Sync audio with video position
    if (audioRef.current && Math.abs(currentTime - (status.positionMillis || 0) / 1000) > 0.1) {
      try {
        await audioRef.current.setPositionAsync(status.positionMillis || 0);
      } catch (error) {
        console.error('Error syncing audio:', error);
      }
    }

    // Loop when video ends
    if (status.didJustFinish) {
      await videoRef.current?.setPositionAsync(0);
      if (audioRef.current) {
        await audioRef.current.setPositionAsync(0);
      }
    }
  };

  const handleSeek = async (value: number) => {
    const position = value * duration * 1000; // Convert to milliseconds

    try {
      if (videoRef.current) {
        await videoRef.current.setPositionAsync(position);
      }
      if (audioRef.current) {
        await audioRef.current.setPositionAsync(position);
      }
      setCurrentTime(value * duration);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const toggleMute = async () => {
    try {
      if (audioRef.current) {
        await audioRef.current.setIsMutedAsync(!isMuted);
        setIsMuted(!isMuted);
      }
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      let exportedUri: string;

      if (exportOptions.includeVideo) {
        exportedUri = await exportService.exportVideoWithAudio(
          videoUri,
          audioUri,
          exportOptions
        );
      } else {
        exportedUri = await exportService.exportAudio(audioUri, exportOptions);
      }

      setAlertConfig({
        type: 'success',
        title: 'Export Complete!',
        message: `Your ${exportOptions.includeVideo ? 'video with soundtrack' : 'audio track'} has been saved successfully.`,
      });
      setAlertVisible(true);
    } catch (error) {
      setAlertConfig({
        type: 'error',
        title: 'Export Failed',
        message: 'Please try again.',
      });
      setAlertVisible(true);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    try {
      setIsExporting(true);

      let exportedUri: string;
      let mimeType: string;

      if (exportOptions.includeVideo) {
        exportedUri = await exportService.exportVideoWithAudio(
          videoUri,
          audioUri,
          exportOptions
        );
        mimeType = 'video/mp4';
      } else {
        exportedUri = await exportService.exportAudio(audioUri, exportOptions);
        mimeType = exportOptions.format === 'mp3' ? 'audio/mpeg' : 'audio/wav';
      }

      await exportService.shareFile(exportedUri, mimeType);
    } catch (error) {
      setAlertConfig({
        type: 'error',
        title: 'Share Failed',
        message: 'Unable to share your file. Please try again.',
      });
      setAlertVisible(true);
    } finally {
      setIsExporting(false);
    }
  };

  const generateVariation = () => {
    Alert.alert(
      'Generate Variation',
      'This will create a new version of the soundtrack with different styling.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: () => {
            navigation.navigate('MusicGeneration', {
              videoUri,
              prompt: 'variation',
            });
          },
        },
      ]
    );
  };

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
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.title}>Preview & Export</Text>
                <Text style={styles.subtitle}>
                  Your AI-generated soundtrack is ready!
                </Text>
              </View>

              <View style={styles.videoContainer}>
                <Video
                  ref={videoRef}
                  style={styles.video}
                  source={{ uri: videoUri }}
                  useNativeControls={false}
                  resizeMode="contain"
                  isLooping
                  onPlaybackStatusUpdate={handleVideoStatusUpdate}
                />

                <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={24}
                    color="white"
                  />
                </TouchableOpacity>

                {/* Timeline and controls */}
                <View style={styles.timelineContainer}>
                  <View style={styles.timelineControls}>
                    <TouchableOpacity onPress={toggleMute} style={styles.muteButton}>
                      <Ionicons
                        name={isMuted ? 'volume-mute' : 'volume-high'}
                        size={18}
                        color="white"
                      />
                    </TouchableOpacity>

                    <View style={styles.timeDisplay}>
                      <Text style={styles.timeText}>
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </Text>
                    </View>
                  </View>

                  <Slider
                    style={styles.slider}
                    value={duration > 0 ? currentTime / duration : 0}
                    onValueChange={handleSeek}
                    minimumValue={0}
                    maximumValue={1}
                    minimumTrackTintColor="#A855F7"
                    maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                    thumbTintColor="#A855F7"
                  />
                </View>
              </View>

              <View style={styles.controls}>
                <TouchableOpacity style={styles.controlButton} onPress={generateVariation}>
                  <Ionicons name="refresh" size={16} color="#A855F7" />
                  <Text style={styles.controlButtonText}>Generate Variation</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => setExportOptions(prev => ({
                    ...prev,
                    includeVideo: !prev.includeVideo
                  }))}
                >
                  <Ionicons
                    name={exportOptions.includeVideo ? "videocam" : "volume-high"}
                    size={16}
                    color="#A855F7"
                  />
                  <Text style={styles.controlButtonText}>
                    {exportOptions.includeVideo ? 'Video + Audio' : 'Audio Only'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.exportSection}>
                <Text style={styles.sectionTitle}>Export Options</Text>

                <View style={styles.optionGroup}>
                  <Text style={styles.optionLabel}>Format</Text>
                  <View style={styles.optionButtons}>
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        exportOptions.format === 'mp3' && styles.optionButtonSelected
                      ]}
                      onPress={() => setExportOptions(prev => ({ ...prev, format: 'mp3' }))}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        exportOptions.format === 'mp3' && styles.optionButtonTextSelected
                      ]}>
                        MP3
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        exportOptions.format === 'wav' && styles.optionButtonSelected
                      ]}
                      onPress={() => setExportOptions(prev => ({ ...prev, format: 'wav' }))}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        exportOptions.format === 'wav' && styles.optionButtonTextSelected
                      ]}>
                        WAV
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.optionGroup}>
                  <Text style={styles.optionLabel}>Quality</Text>
                  <View style={styles.optionButtons}>
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        exportOptions.quality === 'standard' && styles.optionButtonSelected
                      ]}
                      onPress={() => setExportOptions(prev => ({ ...prev, quality: 'standard' }))}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        exportOptions.quality === 'standard' && styles.optionButtonTextSelected
                      ]}>
                        Standard
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        exportOptions.quality === 'high' && styles.optionButtonSelected
                      ]}
                      onPress={() => setExportOptions(prev => ({ ...prev, quality: 'high' }))}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        exportOptions.quality === 'high' && styles.optionButtonTextSelected
                      ]}>
                        High Quality
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.checkboxOption}
                  onPress={() => setExportOptions(prev => ({
                    ...prev,
                    includeVideo: !prev.includeVideo
                  }))}
                >
                  <Ionicons
                    name={exportOptions.includeVideo ? 'checkbox' : 'square-outline'}
                    size={20}
                    color="#A855F7"
                  />
                  <Text style={styles.checkboxText}>Include video with soundtrack</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.shareButton, { opacity: isExporting ? 0.6 : 1 }]}
                  onPress={handleShare}
                  disabled={isExporting}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    <Ionicons name="share-social" size={16} color="white" />
                    <Text style={styles.buttonText}>Share</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.exportButton, { opacity: isExporting ? 0.6 : 1 }]}
                  onPress={handleExport}
                  disabled={isExporting}
                >
                  <LinearGradient
                    colors={['#A855F7', '#8B5CF6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    {isExporting ? (
                      <>
                        <Ionicons name="hourglass" size={16} color="white" />
                        <Text style={styles.buttonText}>Exporting...</Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="download" size={16} color="white" />
                        <Text style={styles.buttonText}>Export</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.infoSection}>
                <View style={styles.infoItem}>
                  <Ionicons name="shield-checkmark" size={14} color="#10B981" />
                  <Text style={styles.infoText}>100% Royalty-Free</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="business" size={14} color="#10B981" />
                  <Text style={styles.infoText}>Commercial Use Allowed</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="musical-notes" size={14} color="#10B981" />
                  <Text style={styles.infoText}>AI-Generated Original</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      <CustomAlert
        visible={alertVisible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertVisible(false)}
        buttons={
          alertConfig.type === 'success'
            ? [
                {
                  text: 'Create Another',
                  onPress: () => {
                    setAlertVisible(false);
                    navigation.navigate('VideoUpload');
                  },
                },
                {
                  text: 'Done',
                  style: 'cancel',
                  onPress: () => {
                    setAlertVisible(false);
                    navigation.navigate('MainTabs');
                  },
                },
              ]
            : undefined
        }
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  videoContainer: {
    position: 'relative',
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    aspectRatio: 16 / 9,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 350,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(168, 85, 247, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  timelineControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  muteButton: {
    padding: 4,
  },
  timeDisplay: {
    flex: 1,
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  controlButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  exportSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionGroup: {
    marginBottom: 16,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
    opacity: 0.8,
  },
  optionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionButtonSelected: {
    backgroundColor: '#A855F7',
    borderColor: '#A855F7',
  },
  optionButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    opacity: 0.8,
  },
  optionButtonTextSelected: {
    color: 'white',
    opacity: 1,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkboxText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  shareButton: {
    flex: 1,
    borderRadius: 12,
  },
  exportButton: {
    flex: 1,
    borderRadius: 12,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    gap: 6,
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});