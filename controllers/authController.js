import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {
  const { name, username, email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, username, email, password });

    // Create JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    // Return user object (excluding password)
    const userObj = {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    };
    res.status(201).json({ message: 'Signup successful', token, user: userObj });
  } catch (err) {
    res.status(500).json({ message: 'Signup error', error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    // Return user object (excluding password)
    const userObj = {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    };
    res.json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'User fetch error' });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // In production, send email with reset link
    // For now, just return the token (in production, this would be sent via email)
    res.json({ 
      message: 'Password reset link sent to email',
      resetToken: resetToken // Remove this in production
    });
  } catch (err) {
    res.status(500).json({ message: 'Password reset error', error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set new password (model will hash it automatically)
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid or expired reset token' });
    }
    res.status(500).json({ message: 'Password reset error', error: err.message });
  }
};
