import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    console.log('Profile update request received');
    console.log('Request body:', req.body);
    console.log('User ID:', req.user.id);
    
    const { name, username, avatar, bio, socials } = req.body;
    
    const updateData = { $set: { name, username, avatar, bio, socials } };
    console.log('Update data:', updateData);
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    console.log('Profile updated successfully:', user._id);
    res.json(user);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Update failed' });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return res.status(400).json({ error: 'Old password incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Password change failed' });
  }
};

// Get user preferences
export const getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('preferences');
    res.json(user.preferences || {});
  } catch (err) {
    res.status(500).json({ error: 'Failed to get preferences' });
  }
};

// Update user preferences
export const updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { preferences } },
      { new: true, runValidators: true }
    ).select('preferences');
    res.json(user.preferences);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update preferences' });
  }
};

// Upload avatar
export const uploadAvatar = async (req, res) => {
  try {
    console.log('Avatar upload request received');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('User ID:', req.user.id);
    console.log('Request headers:', req.headers);
    
    let avatarUrl = req.body.avatarUrl;
    
    // If there's a file uploaded, handle it
    if (req.file) {
      console.log('File uploaded:', req.file.originalname, req.file.mimetype, req.file.size);
      console.log('File buffer length:', req.file.buffer ? req.file.buffer.length : 'No buffer');
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '..', 'uploads', 'avatars');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Generate unique filename
      const fileExtension = path.extname(req.file.originalname);
      const fileName = `avatar_${req.user.id}_${Date.now()}${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);
      
      // Save file to disk
      fs.writeFileSync(filePath, req.file.buffer);
      console.log('File saved to:', filePath);
      
      // Create URL for the uploaded file
      avatarUrl = `/uploads/avatars/${fileName}`;
      
    } else {
      console.log('No file uploaded, using provided URL or existing avatar');
    }
    
    if (!avatarUrl) {
      console.log('No avatar URL provided');
      return res.status(400).json({ error: 'No avatar URL or file provided' });
    }
    
    console.log('Updating user avatar to:', avatarUrl);
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { avatar: avatarUrl } },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      console.log('User not found for ID:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User updated successfully:', user._id);
    
    res.json({ user, avatarUrl });
  } catch (err) {
    console.error('Avatar upload error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ error: 'Failed to upload avatar', details: err.message });
  }
};
