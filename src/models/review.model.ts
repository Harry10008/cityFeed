import mongoose from 'mongoose';

// App Review Schema
const AppReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  },
  version: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    enum: ['ios', 'android', 'web'],
    required: true
  }
}, {
  timestamps: true
});

// Venue Review Schema
const VenueReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue', // Assuming you have a Venue model
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  },
  photos: [{
    type: String // URLs to review photos
  }],
  helpful: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reported: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Indexes for better performance
AppReviewSchema.index({ user: 1 });
AppReviewSchema.index({ rating: -1 });
AppReviewSchema.index({ createdAt: -1 });

VenueReviewSchema.index({ venue: 1, createdAt: -1 });
VenueReviewSchema.index({ user: 1, venue: 1 }, { unique: true }); // One review per user per venue
VenueReviewSchema.index({ rating: -1 });

export const AppReview = mongoose.model('AppReview', AppReviewSchema);
export const VenueReview = mongoose.model('VenueReview', VenueReviewSchema); 