import express from 'express';
const router = express.Router();

// Admin dashboard route
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Admin dashboard - coming soon' });
});

// Admin users management
router.get('/users', (req, res) => {
  res.json({ message: 'Users management - coming soon' });
});

// Admin analytics
router.get('/analytics', (req, res) => {
  res.json({ message: 'Analytics - coming soon' });
});

export default router; 