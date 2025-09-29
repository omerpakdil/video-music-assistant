import express from 'express';
import { MusicGenerationService } from '../services/MusicGenerationService';
import { auth } from '../middleware/auth';
import { checkSubscription } from '../middleware/subscription';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

/**
 * POST /api/music-generation/generate
 * Generate music based on video analysis
 */
router.post('/generate',
  auth,
  checkSubscription,
  validateRequest,
  async (req, res, next) => {
    try {
      const {
        videoAnalysis,
        stylePrompt,
        duration,
        quality = 'standard'
      } = req.body;

      if (!videoAnalysis) {
        return res.status(400).json({
          error: 'Video analysis data is required'
        });
      }

      const musicService = new MusicGenerationService();

      const generatedMusic = await musicService.generateMusic({
        analysis: videoAnalysis,
        stylePrompt,
        duration,
        quality,
        userId: req.user?.id
      });

      res.json({
        success: true,
        data: generatedMusic,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/music-generation/variation
 * Generate a variation of existing music
 */
router.post('/variation',
  auth,
  checkSubscription,
  async (req, res, next) => {
    try {
      const {
        originalMusicId,
        variationType = 'style'
      } = req.body;

      const musicService = new MusicGenerationService();

      const variation = await musicService.generateVariation({
        originalMusicId,
        variationType,
        userId: req.user?.id
      });

      res.json({
        success: true,
        data: variation,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/music-generation/styles
 * Get available music styles
 */
router.get('/styles', (req, res) => {
  const styles = [
    {
      id: 'lofi',
      name: 'Lo-fi Hip Hop',
      description: 'Relaxed, mellow beats with vintage vinyl sound',
      tags: ['chill', 'study', 'relaxed', 'vintage']
    },
    {
      id: 'cinematic',
      name: 'Cinematic',
      description: 'Epic orchestral music for dramatic content',
      tags: ['epic', 'orchestral', 'dramatic', 'emotional']
    },
    {
      id: 'edm',
      name: 'Electronic Dance Music',
      description: 'High-energy electronic beats',
      tags: ['energetic', 'electronic', 'dance', 'upbeat']
    },
    {
      id: 'jazz',
      name: 'Jazz',
      description: 'Smooth jazz with improvisation',
      tags: ['smooth', 'sophisticated', 'improvised', 'classic']
    },
    {
      id: 'rock',
      name: 'Rock',
      description: 'Guitar-driven rock music',
      tags: ['guitar', 'powerful', 'energetic', 'driving']
    },
    {
      id: 'ambient',
      name: 'Ambient',
      description: 'Atmospheric soundscapes',
      tags: ['atmospheric', 'peaceful', 'ethereal', 'background']
    }
  ];

  res.json({
    success: true,
    data: styles
  });
});

/**
 * GET /api/music-generation/history
 * Get user's music generation history
 */
router.get('/history',
  auth,
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const musicService = new MusicGenerationService();

      const history = await musicService.getUserHistory({
        userId: req.user?.id,
        page,
        limit
      });

      res.json({
        success: true,
        data: history,
        pagination: {
          page,
          limit,
          total: history.total,
          pages: Math.ceil(history.total / limit)
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/music-generation/:id
 * Delete a generated music track
 */
router.delete('/:id',
  auth,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const musicService = new MusicGenerationService();

      await musicService.deleteGeneration({
        id,
        userId: req.user?.id
      });

      res.json({
        success: true,
        message: 'Music track deleted successfully'
      });

    } catch (error) {
      next(error);
    }
  }
);

export { router as musicGenerationRouter };