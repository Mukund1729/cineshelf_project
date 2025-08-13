import express from 'express';

import auth from '../middleware/auth.js';
import { getSakha, addSakha, removeSakha, searchPeople } from '../controllers/peopleController.js';

const router = express.Router();


// Get sakha/sakhi (friends) list
router.get('/sakha', auth, getSakha);

// Add sakha/sakhi (friend)
router.post('/sakha', auth, addSakha);

// Remove sakha/sakhi (friend)
router.delete('/sakha/:id', auth, removeSakha);

// Search users by username or email
router.get('/search', auth, searchPeople);

export default router;
