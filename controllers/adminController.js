import User from '../models/User.js';
import Watchlist from '../models/Watchlist.js';
import Review from '../models/Review.js';
import List from '../models/List.js';
import Notification from '../models/Notification.js';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { username, email, isAdmin, isVerified, preferences } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, isAdmin, isVerified, preferences },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Also delete associated data
    await Watchlist.deleteMany({ user: req.params.id });
    await Review.deleteMany({ user: req.params.id });
    await List.deleteMany({ user: req.params.id });
    await Notification.deleteMany({ user: req.params.id });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Create admin user
export const createAdminUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const user = await User.create({
      username,
      email,
      password,
      isAdmin: true,
      isVerified: true
    });
    
    const userObj = {
      _id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    };
    
    res.status(201).json(userObj);
  } catch (error) {
    console.error('Create admin user error:', error);
    res.status(500).json({ error: 'Failed to create admin user' });
  }
};

// Get system statistics
export const getSystemStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalWatchlists,
      totalReviews,
      totalLists,
      totalNotifications,
      recentUsers,
      activeUsers
    ] = await Promise.all([
      User.countDocuments(),
      Watchlist.countDocuments(),
      Review.countDocuments(),
      List.countDocuments(),
      Notification.countDocuments(),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
    ]);
    
    res.json({
      users: {
        total: totalUsers,
        recent: recentUsers,
        active: activeUsers
      },
      content: {
        watchlists: totalWatchlists,
        reviews: totalReviews,
        lists: totalLists,
        notifications: totalNotifications
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ error: 'Failed to fetch system statistics' });
  }
};

// Get system logs (placeholder for now)
export const getSystemLogs = async (req, res) => {
  try {
    // In production, this would fetch from a logging service
    const logs = [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'System running normally',
        service: 'api'
      }
    ];
    
    res.json(logs);
  } catch (error) {
    console.error('Get system logs error:', error);
    res.status(500).json({ error: 'Failed to fetch system logs' });
  }
}; 