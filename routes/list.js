import express from 'express';

import auth from '../middleware/auth.js';
import { getList, addToList, removeFromList } from '../controllers/listController.js';

const router = express.Router();


// Get user's list
router.get('/', auth, getList);

// Add movie to list
router.post('/', auth, addToList);

// Remove movie from list
router.delete('/:tmdbId', auth, removeFromList);

export default router;
