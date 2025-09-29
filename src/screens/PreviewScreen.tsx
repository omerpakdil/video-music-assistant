import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Video } from 'expo-av';
import { ExportOptions } from '../types';
import { ExportService } from '../services/exportService';

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
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'mp3',
    quality: 'standard',
    includeVideo: true,
  });

  const videoRef = useRef<Video>(null);
  const exportService = new ExportService();

  const togglePlayback = async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
    setIsPlaying(!isPlaying);
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

      Alert.alert(
        'Export Complete!',
        `Your ${exportOptions.includeVideo ? 'video with soundtrack' : 'audio track'} has been saved to your device.`,
        [
          {
            text: 'Share',
            onPress: () => exportService.shareFile(
              exportedUri,
              exportOptions.includeVideo ? 'video/mp4' : `audio/${exportOptions.format}`
            ),
          },
          {
            text: 'Create Another',
            onPress: () => navigation.navigate('VideoUpload'),
          },
          {
            text: 'Done',
            onPress: () => navigation.navigate('MainTabs'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Export Failed', 'Please try again.');
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
                  onPlaybackStatusUpdate={(status) => {
                    if ('isPlaying' in status) {
                      setIsPlaying(status.isPlaying);
                    }
                  }}
                />

                <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={24}
                    color="white"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.controls}>
                <TouchableOpacity style={styles.controlButton} onPress={generateVariation}>
                  <Ionicons name="refresh" size={16} color="#A855F7" />
                  <Text style={styles.controlButtonText}>Generate Variation</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlButton}>
                  <Ionicons name="volume-high" size={16} color="#A855F7" />
                  <Text style={styles.controlButtonText}>Audio Only</Text>
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

              <TouchableOpacity
                style={[styles.exportButton, { opacity: isExporting ? 0.6 : 1 }]}
                onPress={handleExport}
                disabled={isExporting}
              >
                <LinearGradient
                  colors={['#A855F7', '#8B5CF6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.exportGradient}
                >
                  {isExporting ? (
                    <>
                      <Text style={styles.exportButtonText}>Exporting...</Text>
                      <Ionicons name="hourglass" size={16} color="white" />
                    </>
                  ) : (
                    <>
                      <Text style={styles.exportButtonText}>Export & Save</Text>
                      <Ionicons name="download" size={16} color="white" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

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
    transform: [{ translateX: -15 }, { translateY: -15 }],
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(168, 85, 247, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
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
  exportButton: {
    borderRadius: 12,
    marginBottom: 16,
  },
  exportGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  exportButtonText: {
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