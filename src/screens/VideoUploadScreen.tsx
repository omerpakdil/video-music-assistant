import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { VideoSource } from '../types';
import CustomAlert from '../components/CustomAlert';

type VideoUploadScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'VideoUpload'
>;

interface Props {
  navigation: VideoUploadScreenNavigationProp;
}

const { width } = Dimensions.get('window');

interface VideoMetadata {
  uri: string;
  name: string;
  size: number;
  type: string;
  duration?: number;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_DURATION = 300; // 5 minutes in seconds

export default function VideoUploadScreen({ navigation }: Props) {
  const [urlInput, setUrlInput] = useState('');
  const [stylePrompt, setStylePrompt] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoSource | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ type: 'success' as const, title: '', message: '' });

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlertConfig({ type, title, message });
    setAlertVisible(true);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoUpload = async () => {
    try {
      setIsUploading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // File size validation
        if (asset.size && asset.size > MAX_FILE_SIZE) {
          showAlert(
            'error',
            'File Too Large',
            `Video size (${formatFileSize(asset.size)}) exceeds the maximum allowed size of ${formatFileSize(MAX_FILE_SIZE)}.`
          );
          setIsUploading(false);
          return;
        }

        const metadata: VideoMetadata = {
          uri: asset.uri,
          name: asset.name,
          size: asset.size || 0,
          type: asset.mimeType || 'video/*',
        };

        setVideoMetadata(metadata);

        const videoSource: VideoSource = {
          type: 'upload',
          uri: asset.uri,
        };

        setSelectedVideo(videoSource);
        showAlert('success', 'Video Selected', `${asset.name} (${formatFileSize(asset.size || 0)}) is ready for processing.`);
      }
    } catch (error) {
      showAlert('error', 'Upload Failed', 'Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      showAlert('error', 'Invalid URL', 'Please enter a valid video URL');
      return;
    }

    // Validate URL format
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(urlInput.trim())) {
      showAlert('error', 'Invalid URL', 'Please enter a valid URL format');
      return;
    }

    // Check for supported platforms
    const url = urlInput.trim().toLowerCase();
    const supportedPlatforms = ['tiktok.com', 'youtube.com', 'youtu.be', 'instagram.com'];
    const isSupported = supportedPlatforms.some(platform => url.includes(platform));

    if (!isSupported) {
      showAlert('warning', 'Platform Not Supported', 'Currently, we only support TikTok, YouTube, and Instagram videos.');
      return;
    }

    const videoSource: VideoSource = {
      type: 'url',
      uri: urlInput.trim(),
    };

    proceedToGeneration(videoSource);
  };

  const proceedToGeneration = (videoSource: VideoSource) => {
    navigation.navigate('MusicGeneration', {
      videoUri: videoSource.uri,
      prompt: stylePrompt.trim() || undefined,
    });
  };

  const musicStyles = [
    { id: 'lofi', name: 'Lo-fi Hip Hop', emoji: '🎵' },
    { id: 'cinematic', name: 'Cinematic', emoji: '🎬' },
    { id: 'edm', name: 'EDM', emoji: '🎧' },
    { id: 'jazz', name: 'Jazz', emoji: '🎷' },
    { id: 'rock', name: 'Rock', emoji: '🎸' },
    { id: 'ambient', name: 'Ambient', emoji: '🌙' },
  ];

  const selectStyle = (style: string) => {
    setStylePrompt(style);
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
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Create Music</Text>
                <Text style={styles.subtitle}>Upload video or paste link to get started</Text>
              </View>
            </View>

            {/* Upload Options */}
            <View style={styles.uploadOptions}>
              <TouchableOpacity
                style={styles.uploadCard}
                onPress={handleVideoUpload}
                disabled={isUploading}
              >
                <View style={styles.uploadIcon}>
                  {isUploading ? (
                    <ActivityIndicator color="#A855F7" size="small" />
                  ) : (
                    <Ionicons name="videocam" size={24} color="#A855F7" />
                  )}
                </View>
                <Text style={styles.uploadTitle}>Upload Video</Text>
                <Text style={styles.uploadSubtitle}>From your device</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.uploadCard}>
                <View style={styles.uploadIcon}>
                  <Ionicons name="link" size={24} color="#10B981" />
                </View>
                <Text style={styles.uploadTitle}>Paste Link</Text>
                <Text style={styles.uploadSubtitle}>TikTok, YouTube</Text>
              </TouchableOpacity>
            </View>

            {/* Video Preview */}
            {videoMetadata && selectedVideo && (
              <View style={styles.previewSection}>
                <Text style={styles.sectionLabel}>Selected Video</Text>
                <View style={styles.previewCard}>
                  <Video
                    source={{ uri: videoMetadata.uri }}
                    style={styles.videoPreview}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping={false}
                  />
                  <View style={styles.previewInfo}>
                    <Text style={styles.previewName} numberOfLines={1}>{videoMetadata.name}</Text>
                    <Text style={styles.previewDetails}>
                      {formatFileSize(videoMetadata.size)}
                      {videoMetadata.duration && ` • ${formatDuration(videoMetadata.duration)}`}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => {
                      setSelectedVideo(null);
                      setVideoMetadata(null);
                    }}
                  >
                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* URL Input */}
            {!selectedVideo && (
              <View style={styles.urlSection}>
                <Text style={styles.sectionLabel}>Video URL</Text>
                <TextInput
                  style={styles.urlInput}
                  placeholder="Paste TikTok, YouTube or Instagram link here..."
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={urlInput}
                  onChangeText={setUrlInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
              </View>
            )}

            {/* Music Styles */}
            <View style={styles.styleSection}>
              <Text style={styles.sectionLabel}>Music Style (Optional)</Text>
              <View style={styles.styleGrid}>
                {musicStyles.slice(0, 6).map((style) => (
                  <TouchableOpacity
                    key={style.id}
                    style={[
                      styles.styleChip,
                      stylePrompt === style.name && styles.styleChipSelected
                    ]}
                    onPress={() => selectStyle(style.name)}
                  >
                    <Text style={styles.styleEmoji}>{style.emoji}</Text>
                    <Text style={[
                      styles.styleChipText,
                      stylePrompt === style.name && styles.styleChipTextSelected
                    ]}>
                      {style.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Generate Button */}
            <TouchableOpacity
              style={[styles.generateButton, { opacity: (urlInput.trim() || selectedVideo) ? 1 : 0.5 }]}
              onPress={handleUrlSubmit}
              disabled={!(urlInput.trim() || selectedVideo)}
            >
              <LinearGradient
                colors={['#A855F7', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.generateGradient}
              >
                <Text style={styles.generateButtonText}>Generate Music</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <CustomAlert
        visible={alertVisible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertVisible(false)}
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
    paddingTop: 50,
    paddingBottom: 100, // Navbar için space
    justifyContent: 'flex-start',
  },

  // Header
  header: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },

  // Upload Options
  uploadOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  uploadCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
  },

  // URL Section
  urlSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  urlInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Style Section
  styleSection: {
    marginBottom: 20,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  styleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
  },
  styleChipSelected: {
    backgroundColor: 'rgba(168, 85, 247, 0.3)',
    borderColor: '#A855F7',
  },
  styleEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  styleChipText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  styleChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Video Preview
  previewSection: {
    marginBottom: 20,
  },
  previewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  videoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#000',
    marginBottom: 12,
  },
  previewInfo: {
    flexDirection: 'column',
  },
  previewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  previewDetails: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },

  // Generate Button
  generateButton: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 50,
    gap: 8,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});