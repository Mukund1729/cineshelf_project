
import mongoose from 'mongoose';
const { Schema } = mongoose;

const ReviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tmdbId: { type: Number, required: true },
  title: String,
  poster: String,
  posterUrl: String, // Alternative field name
  poster_path: String, // TMDB poster path
  rating: { type: Number, min: 0, max: 10 },
  review: { type: String },
  mediaType: { type: String, enum: ['movie', 'tv'], default: 'movie' }, // Distinguish between movies and TV shows
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Review', ReviewSchema);
