import express from 'express';

import auth from '../middleware/auth.js';
import { getReviews, addReview, updateReview, deleteReview } from '../controllers/reviewController.js';

const router = express.Router();


// Get all reviews by user
router.get('/', auth, getReviews);

// Add a review
router.post('/', auth, addReview);

// Update a review
router.put('/:id', auth, updateReview);

// Delete a review
router.delete('/:id', auth, deleteReview);

export default router;
