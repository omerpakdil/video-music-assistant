import express from 'express';
import multer from 'multer';
import { VideoAnalysisService } from '../services/VideoAnalysisService';
import { auth } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/video-analysis/analyze
 * Analyze video for music generation parameters
 */
router.post('/analyze',
  auth,
  upload.single('video'),
  validateRequest,
  async (req, res, next) => {
    try {
      const { videoUrl } = req.body;
      const videoFile = req.file;

      if (!videoUrl && !videoFile) {
        return res.status(400).json({
          error: 'Either videoUrl or video file is required'
        });
      }

      const analysisService = new VideoAnalysisService();

      let analysis;
      if (videoFile) {
        analysis = await analysisService.analyzeUploadedVideo(videoFile);
      } else {
        analysis = await analysisService.analyzeVideoUrl(videoUrl);
      }

      res.json({
        success: true,
        data: analysis,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/video-analysis/supported-platforms
 * Get list of supported video platforms
 */
router.get('/supported-platforms', (req, res) => {
  res.json({
    platforms: [
      {
        name: 'TikTok',
        domain: 'tiktok.com',
        supported: true
      },
      {
        name: 'YouTube',
        domain: 'youtube.com',
        supported: true
      },
      {
        name: 'Instagram',
        domain: 'instagram.com',
        supported: true
      },
      {
        name: 'Twitter',
        domain: 'twitter.com',
        supported: false
      }
    ]
  });
});

/**
 * POST /api/video-analysis/batch
 * Analyze multiple videos in batch
 */
router.post('/batch',
  auth,
  upload.array('videos', 10),
  async (req, res, next) => {
    try {
      const { videoUrls } = req.body;
      const videoFiles = req.files as Express.Multer.File[];

      const analysisService = new VideoAnalysisService();
      const results = [];

      // Process uploaded files
      if (videoFiles) {
        for (const file of videoFiles) {
          const analysis = await analysisService.analyzeUploadedVideo(file);
          results.push({
            filename: file.originalname,
            analysis
          });
        }
      }

      // Process URLs
      if (videoUrls && Array.isArray(videoUrls)) {
        for (const url of videoUrls) {
          const analysis = await analysisService.analyzeVideoUrl(url);
          results.push({
            url,
            analysis
          });
        }
      }

      res.json({
        success: true,
        data: results,
        count: results.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      next(error);
    }
  }
);

export { router as videoAnalysisRouter };