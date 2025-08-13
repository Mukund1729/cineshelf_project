import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Added name field
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt:{ type: Date, default: Date.now },
  sakha:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // friends/following
  avatar:   { type: String, default: '' }, // profile picture URL
  bio:      { type: String, default: '' }, // user bio
  socials:  {
    instagram: { type: String, default: '' },
    twitter:   { type: String, default: '' },
    website:   { type: String, default: '' }
  },
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'dark' },
    language: { type: String, default: 'en' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    privacy: {
      profileVisibility: { type: String, enum: ['public', 'private', 'friends'], default: 'public' },
      showWatchlist: { type: Boolean, default: true },
      showReviews: { type: Boolean, default: true }
    },
    moviePreferences: {
      preferredGenres: [{ type: String }],
      preferredLanguages: [{ type: String }],
      includeAdultContent: { type: Boolean, default: false }
    }
  },
  isAdmin: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  lastActive: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare password
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
