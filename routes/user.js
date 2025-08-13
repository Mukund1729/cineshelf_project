import express from 'express';
import multer from 'multer';
import auth from '../middleware/auth.js';
import { getProfile, updateProfile, changePassword, getPreferences, updatePreferences, uploadAvatar } from '../controllers/userController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('Multer file filter - file:', file.originalname, 'mimetype:', file.mimetype);
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: 'File upload error: ' + err.message });
  } else if (err) {
    console.error('File filter error:', err);
    return res.status(400).json({ error: err.message });
  }
  next();
};

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/password', auth, changePassword);
router.get('/preferences', auth, getPreferences);
router.put('/preferences', auth, updatePreferences);
router.post('/avatar', auth, upload.single('avatar'), handleMulterError, uploadAvatar);

export default router;
