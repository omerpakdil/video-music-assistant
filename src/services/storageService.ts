import * as FileSystem from 'expo-file-system';
import { ConfigService } from './configService';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
}

/**
 * Storage Service
 * Handles file uploads and downloads with Firebase Storage or AWS S3
 */
export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Upload a file to cloud storage
   */
  async uploadFile(
    fileUri: string,
    folder: 'videos' | 'audio' | 'thumbnails',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 9);
      const extension = fileUri.split('.').pop() || 'mp4';
      const fileName = `${folder}/${timestamp}_${randomStr}.${extension}`;

      // Check if Firebase or AWS is configured
      const firebaseConfig = ConfigService.firebase;
      const awsConfig = ConfigService.aws;

      if (firebaseConfig.storageBucket) {
        return await this.uploadToFirebase(fileUri, fileName, fileInfo, onProgress);
      } else if (awsConfig.bucketName) {
        return await this.uploadToS3(fileUri, fileName, fileInfo, onProgress);
      } else {
        // Fallback to mock upload for development
        console.warn('No cloud storage configured, using mock upload');
        return await this.mockUpload(fileUri, fileName, fileInfo);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Upload to Firebase Storage
   */
  private async uploadToFirebase(
    fileUri: string,
    fileName: string,
    fileInfo: FileSystem.FileInfo,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    // Note: Firebase SDK for React Native requires additional setup
    // This is a placeholder implementation
    // In production, use @react-native-firebase/storage

    throw new Error('Firebase upload not yet implemented. Please configure Firebase Storage SDK.');
  }

  /**
   * Upload to AWS S3
   */
  private async uploadToS3(
    fileUri: string,
    fileName: string,
    fileInfo: FileSystem.FileInfo,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    // Note: AWS SDK for React Native requires additional setup
    // This is a placeholder implementation
    // In production, use aws-sdk or AWS Amplify

    throw new Error('AWS S3 upload not yet implemented. Please configure AWS SDK.');
  }

  /**
   * Mock upload for development
   */
  private async mockUpload(
    fileUri: string,
    fileName: string,
    fileInfo: FileSystem.FileInfo
  ): Promise<UploadResult> {
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      url: `https://mock-storage.example.com/${fileName}`,
      fileName,
      fileSize: fileInfo.size || 0,
      mimeType: this.getMimeType(fileName),
      uploadedAt: new Date(),
    };
  }

  /**
   * Download a file from cloud storage
   */
  async downloadFile(
    url: string,
    destinationUri: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    try {
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        destinationUri,
        {},
        (downloadProgress) => {
          if (onProgress) {
            const progress: UploadProgress = {
              loaded: downloadProgress.totalBytesWritten,
              total: downloadProgress.totalBytesExpectedToWrite,
              percentage:
                downloadProgress.totalBytesExpectedToWrite > 0
                  ? (downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) * 100
                  : 0,
            };
            onProgress(progress);
          }
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (!result) {
        throw new Error('Download failed');
      }

      return result.uri;
    } catch (error) {
      console.error('Download failed:', error);
      throw new Error('Failed to download file');
    }
  }

  /**
   * Delete a file from cloud storage
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const firebaseConfig = ConfigService.firebase;
      const awsConfig = ConfigService.aws;

      if (firebaseConfig.storageBucket) {
        await this.deleteFromFirebase(fileUrl);
      } else if (awsConfig.bucketName) {
        await this.deleteFromS3(fileUrl);
      } else {
        // Mock delete for development
        console.log('Mock delete:', fileUrl);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      throw new Error('Failed to delete file');
    }
  }

  private async deleteFromFirebase(fileUrl: string): Promise<void> {
    // Placeholder for Firebase deletion
    throw new Error('Firebase delete not yet implemented');
  }

  private async deleteFromS3(fileUrl: string): Promise<void> {
    // Placeholder for S3 deletion
    throw new Error('AWS S3 delete not yet implemented');
  }

  /**
   * Get signed URL for temporary access
   */
  async getSignedUrl(fileUrl: string, expiresIn: number = 3600): Promise<string> {
    try {
      // In production, this would generate a signed URL from Firebase or S3
      // For now, return the original URL
      return fileUrl;
    } catch (error) {
      console.error('Failed to get signed URL:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileUrl: string): Promise<{
    size: number;
    contentType: string;
    createdAt: Date;
  } | null> {
    try {
      // In production, this would fetch metadata from cloud storage
      return null;
    } catch (error) {
      console.error('Failed to get file metadata:', error);
      return null;
    }
  }

  /**
   * Determine MIME type from file extension
   */
  private getMimeType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      m4a: 'audio/mp4',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
    };
    return mimeTypes[extension || ''] || 'application/octet-stream';
  }

  /**
   * Validate file size
   */
  validateFileSize(fileSize: number, maxSize: number = 50 * 1024 * 1024): boolean {
    return fileSize <= maxSize;
  }

  /**
   * Validate file type
   */
  validateFileType(fileName: string, allowedTypes: string[]): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? allowedTypes.includes(extension) : false;
  }
}

export default StorageService.getInstance();
