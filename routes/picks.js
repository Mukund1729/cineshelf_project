import express from 'express';
import { 
  getAllPicks, 
  getPicksByType, 
  getCommunityLists, 
  getDirectorSpotlights,
  createPick,
  updatePick,
  deletePick
} from '../controllers/picksController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all picks
router.get('/', getAllPicks);

// Get picks by type (editor, visual, decade, etc.)
router.get('/type/:type', getPicksByType);

// Get community lists
router.get('/community', getCommunityLists);

// Get director spotlights
router.get('/directors', getDirectorSpotlights);

// Admin routes (protected)
router.post('/', auth, createPick);
router.put('/:id', auth, updatePick);
router.delete('/:id', auth, deletePick);

export default router; 