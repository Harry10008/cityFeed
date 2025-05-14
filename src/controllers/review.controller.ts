import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service';
import { 
  CreateAppReviewDto, 
  CreateVenueReviewDto, 
  UpdateReviewDto,
  ReportReviewDto 
} from '../dto/review.dto';

export class ReviewController {
  private reviewService: ReviewService;

  constructor() {
    this.reviewService = new ReviewService();
  }

  // App Reviews
  createAppReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reviewData = CreateAppReviewDto.parse(req.body);
      const review = await this.reviewService.createAppReview(req.user._id, reviewData);
      
      res.status(201).json({
        status: 'success',
        data: { review }
      });
    } catch (error) {
      next(error);
    }
  };

  getAppReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const rating = req.query.rating ? parseInt(req.query.rating as string) : undefined;

      const result = await this.reviewService.getAppReviews(page, limit, rating);
      
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  updateAppReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reviewId } = req.params;
      const updateData = UpdateReviewDto.parse(req.body);
      
      const review = await this.reviewService.updateAppReview(reviewId, req.user._id, updateData);
      
      res.status(200).json({
        status: 'success',
        data: { review }
      });
    } catch (error) {
      next(error);
    }
  };

  deleteAppReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reviewId } = req.params;
      await this.reviewService.deleteAppReview(reviewId, req.user._id);
      
      res.status(204).json({
        status: 'success',
        message: 'Review deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Venue Reviews
  createVenueReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reviewData = CreateVenueReviewDto.parse(req.body);
      const review = await this.reviewService.createVenueReview(req.user._id, reviewData);
      
      res.status(201).json({
        status: 'success',
        data: { review }
      });
    } catch (error) {
      next(error);
    }
  };

  getVenueReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { venueId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const rating = req.query.rating ? parseInt(req.query.rating as string) : undefined;

      const result = await this.reviewService.getVenueReviews(venueId, page, limit, rating);
      
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  updateVenueReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reviewId } = req.params;
      const updateData = UpdateReviewDto.parse(req.body);
      
      const review = await this.reviewService.updateVenueReview(reviewId, req.user._id, updateData);
      
      res.status(200).json({
        status: 'success',
        data: { review }
      });
    } catch (error) {
      next(error);
    }
  };

  deleteVenueReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reviewId } = req.params;
      await this.reviewService.deleteVenueReview(reviewId, req.user._id);
      
      res.status(204).json({
        status: 'success',
        message: 'Review deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  markReviewHelpful = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reviewId } = req.params;
      const result = await this.reviewService.markReviewHelpful(reviewId, req.user._id);
      
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  reportReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reviewId } = req.params;
      const { reason } = ReportReviewDto.parse(req.body);
      
      const result = await this.reviewService.reportReview(reviewId, req.user._id, reason);
      
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getVenueRatingStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { venueId } = req.params;
      const stats = await this.reviewService.getVenueRatingStats(venueId);
      
      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };
} 