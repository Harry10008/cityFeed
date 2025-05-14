import mongoose from 'mongoose';
import { AppReview, VenueReview } from '../models/review.model';
import { AppError } from '../utils/appError';
import { CreateAppReviewRequest, CreateVenueReviewRequest, UpdateReviewRequest } from '../dto/review.dto';

export class ReviewService {
  // App Reviews
  async createAppReview(userId: string, reviewData: CreateAppReviewRequest) {
    // Check if user already reviewed the app
    const existingReview = await AppReview.findOne({ user: userId });
    if (existingReview) {
      throw new AppError('You have already reviewed this app', 400);
    }

    const review = await AppReview.create({
      ...reviewData,
      user: userId
    });

    return this.getAppReviewById(review._id.toString());
  }

  async getAppReviews(page: number = 1, limit: number = 10, rating?: number) {
    const skip = (page - 1) * limit;
    const filter = rating ? { rating } : {};

    const [reviews, total] = await Promise.all([
      AppReview.find(filter)
        .populate('user', 'fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AppReview.countDocuments(filter)
    ]);

    return {
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    };
  }

  async getAppReviewById(reviewId: string) {
    const review = await AppReview.findById(reviewId)
      .populate('user', 'fullName avatar');
    
    if (!review) {
      throw new AppError('Review not found', 404);
    }

    return review;
  }

  async updateAppReview(reviewId: string, userId: string, updateData: UpdateReviewRequest) {
    const review = await AppReview.findOne({ _id: reviewId, user: userId });
    
    if (!review) {
      throw new AppError('Review not found or you are not authorized to update it', 404);
    }

    Object.assign(review, updateData);
    await review.save();

    return this.getAppReviewById(reviewId);
  }

  async deleteAppReview(reviewId: string, userId: string) {
    const review = await AppReview.findOne({ _id: reviewId, user: userId });
    
    if (!review) {
      throw new AppError('Review not found or you are not authorized to delete it', 404);
    }

    await AppReview.findByIdAndDelete(reviewId);
  }

  // Venue Reviews
  async createVenueReview(userId: string, reviewData: CreateVenueReviewRequest) {
    // Check if user already reviewed this venue
    const existingReview = await VenueReview.findOne({ 
      user: userId, 
      venue: reviewData.venueId 
    });
    
    if (existingReview) {
      throw new AppError('You have already reviewed this venue', 400);
    }

    const review = await VenueReview.create({
      user: userId,
      venue: reviewData.venueId,
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      photos: reviewData.photos || []
    });

    // Update venue's average rating
    await this.updateVenueRating(reviewData.venueId);

    return this.getVenueReviewById(review._id.toString());
  }

  async getVenueReviews(venueId: string, page: number = 1, limit: number = 10, rating?: number) {
    const skip = (page - 1) * limit;
    const filter: any = { venue: venueId };
    if (rating) filter.rating = rating;

    const [reviews, total] = await Promise.all([
      VenueReview.find(filter)
        .populate('user', 'fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      VenueReview.countDocuments(filter)
    ]);

    return {
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    };
  }

  async getVenueReviewById(reviewId: string) {
    const review = await VenueReview.findById(reviewId)
      .populate('user', 'fullName avatar')
      .populate('venue', 'name address');
    
    if (!review) {
      throw new AppError('Review not found', 404);
    }

    return review;
  }

  async updateVenueReview(reviewId: string, userId: string, updateData: UpdateReviewRequest) {
    const review = await VenueReview.findOne({ _id: reviewId, user: userId });
    
    if (!review) {
      throw new AppError('Review not found or you are not authorized to update it', 404);
    }

    const oldRating = review.rating;
    Object.assign(review, updateData);
    await review.save();

    // Update venue rating if rating changed
    if (updateData.rating && updateData.rating !== oldRating) {
      await this.updateVenueRating(review.venue.toString());
    }

    return this.getVenueReviewById(reviewId);
  }

  async deleteVenueReview(reviewId: string, userId: string) {
    const review = await VenueReview.findOne({ _id: reviewId, user: userId });
    
    if (!review) {
      throw new AppError('Review not found or you are not authorized to delete it', 404);
    }

    const venueId = review.venue.toString();
    await VenueReview.findByIdAndDelete(reviewId);
    
    // Update venue rating after deletion
    await this.updateVenueRating(venueId);
  }

  async markReviewHelpful(reviewId: string, userId: string) {
    const review = await VenueReview.findById(reviewId);
    
    if (!review) {
      throw new AppError('Review not found', 404);
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const isAlreadyHelpful = review.helpful.includes(userObjectId);

    if (isAlreadyHelpful) {
      review.helpful = review.helpful.filter(id => !id.equals(userObjectId));
    } else {
      review.helpful.push(userObjectId);
    }

    await review.save();
    return { helpful: !isAlreadyHelpful, helpfulCount: review.helpful.length };
  }

  async reportReview(reviewId: string, userId: string, reason: string) {
    const review = await VenueReview.findById(reviewId);
    
    if (!review) {
      throw new AppError('Review not found', 404);
    }

    // Check if user already reported this review
    const alreadyReported = review.reported.some(report => 
      report.user && report.user.toString() === userId
    );

    if (alreadyReported) {
      throw new AppError('You have already reported this review', 400);
    }

    review.reported.push({ user: new mongoose.Types.ObjectId(userId), reason });
    await review.save();

    return { message: 'Review reported successfully' };
  }

  private async updateVenueRating(venueId: string) {
    const result = await VenueReview.aggregate([
      { $match: { venue: new mongoose.Types.ObjectId(venueId) } },
      {
        $group: {
          _id: '$venue',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (result.length > 0) {
      // Variables are available for venue model update if needed
      // const { averageRating, totalReviews } = result[0];
      // Update venue model with new rating if you have a Venue model
      // await Venue.findByIdAndUpdate(venueId, {
      //   averageRating: Math.round(averageRating * 10) / 10,
      //   totalReviews
      // });
    }
  }

  async getVenueRatingStats(venueId: string) {
    const result = await VenueReview.aggregate([
      { $match: { venue: new mongoose.Types.ObjectId(venueId) } },
      {
        $group: {
          _id: '$venue',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratings: {
            $push: '$rating'
          }
        }
      },
      {
        $addFields: {
          ratingDistribution: {
            1: { $size: { $filter: { input: '$ratings', cond: { $eq: ['$$this', 1] } } } },
            2: { $size: { $filter: { input: '$ratings', cond: { $eq: ['$$this', 2] } } } },
            3: { $size: { $filter: { input: '$ratings', cond: { $eq: ['$$this', 3] } } } },
            4: { $size: { $filter: { input: '$ratings', cond: { $eq: ['$$this', 4] } } } },
            5: { $size: { $filter: { input: '$ratings', cond: { $eq: ['$$this', 5] } } } }
          }
        }
      }
    ]);

    return result.length > 0 ? result[0] : {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
} 