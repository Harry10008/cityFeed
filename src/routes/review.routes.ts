import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
const reviewController = new ReviewController();

// App Reviews
router.post('/app', protect, reviewController.createAppReview);
router.get('/app', reviewController.getAppReviews);
router.put('/app/:reviewId', protect, reviewController.updateAppReview);
router.delete('/app/:reviewId', protect, reviewController.deleteAppReview);

// Venue Reviews
router.post('/venue', protect, reviewController.createVenueReview);
router.get('/venue/:venueId', reviewController.getVenueReviews);
router.get('/venue/:venueId/stats', reviewController.getVenueRatingStats);
router.put('/venue/:reviewId', protect, reviewController.updateVenueReview);
router.delete('/venue/:reviewId', protect, reviewController.deleteVenueReview);
router.post('/venue/:reviewId/helpful', protect, reviewController.markReviewHelpful);
router.post('/venue/:reviewId/report', protect, reviewController.reportReview);

export default router; 