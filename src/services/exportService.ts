import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { ExportOptions } from '../types';

export class ExportService {
  async exportAudio(
    audioUri: string,
    options: ExportOptions
  ): Promise<string> {
    try {
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Media library permission denied');
      }

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `video-music-assistant-${timestamp}.${options.format}`;

      // Copy file to device storage
      const documentsDir = FileSystem.documentDirectory;
      const localUri = `${documentsDir}${filename}`;

      // In a real app, you would process the audio here based on quality settings
      if (options.quality === 'high') {
        // Apply high-quality export settings
        console.log('Applying high-quality export settings');
      }

      // Copy the audio file
      await FileSystem.copyAsync({
        from: audioUri,
        to: localUri,
      });

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(localUri);
      await MediaLibrary.createAlbumAsync('Video Music Assistant', asset, false);

      return localUri;
    } catch (error) {
      console.error('Audio export failed:', error);
      throw new Error('Failed to export audio');
    }
  }

  async exportVideoWithAudio(
    videoUri: string,
    audioUri: string,
    options: ExportOptions
  ): Promise<string> {
    try {
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Media library permission denied');
      }

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `video-music-assistant-${timestamp}.mp4`;

      // In a real implementation, you would use FFmpeg or similar to merge video and audio
      // For this demo, we'll simulate the process
      await this.simulateVideoProcessing(videoUri, audioUri, options);

      const documentsDir = FileSystem.documentDirectory;
      const localUri = `${documentsDir}${filename}`;

      // Copy processed video (in real app, this would be the merged result)
      await FileSystem.copyAsync({
        from: videoUri,
        to: localUri,
      });

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(localUri);
      await MediaLibrary.createAlbumAsync('Video Music Assistant', asset, false);

      return localUri;
    } catch (error) {
      console.error('Video export failed:', error);
      throw new Error('Failed to export video');
    }
  }

  async shareFile(fileUri: string, mimeType: string): Promise<void> {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType,
          dialogTitle: 'Share your creation',
          UTI: mimeType,
        });
      } else {
        throw new Error('Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Sharing failed:', error);
      throw new Error('Failed to share file');
    }
  }

  private async simulateVideoProcessing(
    videoUri: string,
    audioUri: string,
    options: ExportOptions
  ): Promise<void> {
    // Simulate processing time based on quality
    const processingTime = options.quality === 'high' ? 5000 : 3000;

    return new Promise((resolve) => {
      setTimeout(resolve, processingTime);
    });
  }

  async getStorageInfo(): Promise<{
    totalSpace: number;
    freeSpace: number;
  }> {
    try {
      const totalSpace = await FileSystem.getTotalDiskCapacityAsync();
      const freeSpace = await FileSystem.getFreeDiskStorageAsync();

      return {
        totalSpace: totalSpace || 0,
        freeSpace: freeSpace || 0,
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { totalSpace: 0, freeSpace: 0 };
    }
  }

  formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}