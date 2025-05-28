import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
const reviewController = new ReviewController();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Review management endpoints
 */

/**
 * @swagger
 * /api/reviews/app:
 *   post:
 *     summary: Create a new app review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/app', protect, reviewController.createAppReview);

/**
 * @swagger
 * /api/reviews/app:
 *   get:
 *     summary: Get all app reviews
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: List of app reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   rating:
 *                     type: number
 *                   comment:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
router.get('/app', reviewController.getAppReviews);

/**
 * @swagger
 * /api/reviews/app/{reviewId}:
 *   put:
 *     summary: Update an app review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */
router.put('/app/:reviewId', protect, reviewController.updateAppReview);

/**
 * @swagger
 * /api/reviews/app/{reviewId}:
 *   delete:
 *     summary: Delete an app review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */
router.delete('/app/:reviewId', protect, reviewController.deleteAppReview);

/**
 * @swagger
 * /api/reviews/venue:
 *   post:
 *     summary: Create a new venue review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - venueId
 *               - rating
 *               - comment
 *             properties:
 *               venueId:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/venue', protect, reviewController.createVenueReview);

/**
 * @swagger
 * /api/reviews/venue/{venueId}:
 *   get:
 *     summary: Get reviews for a specific venue
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: venueId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of venue reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   rating:
 *                     type: number
 *                   comment:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   helpfulCount:
 *                     type: number
 */
router.get('/venue/:venueId', reviewController.getVenueReviews);

/**
 * @swagger
 * /api/reviews/venue/{venueId}/stats:
 *   get:
 *     summary: Get rating statistics for a venue
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: venueId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Venue rating statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 averageRating:
 *                   type: number
 *                 totalReviews:
 *                   type: number
 *                 ratingDistribution:
 *                   type: object
 *                   properties:
 *                     "1":
 *                       type: number
 *                     "2":
 *                       type: number
 *                     "3":
 *                       type: number
 *                     "4":
 *                       type: number
 *                     "5":
 *                       type: number
 */
router.get('/venue/:venueId/stats', reviewController.getVenueRatingStats);

/**
 * @swagger
 * /api/reviews/venue/{reviewId}:
 *   put:
 *     summary: Update a venue review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */
router.put('/venue/:reviewId', protect, reviewController.updateVenueReview);

/**
 * @swagger
 * /api/reviews/venue/{reviewId}:
 *   delete:
 *     summary: Delete a venue review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */
router.delete('/venue/:reviewId', protect, reviewController.deleteVenueReview);

/**
 * @swagger
 * /api/reviews/venue/{reviewId}/helpful:
 *   post:
 *     summary: Mark a review as helpful
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review marked as helpful
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */
router.post('/venue/:reviewId/helpful', protect, reviewController.markReviewHelpful);

/**
 * @swagger
 * /api/reviews/venue/{reviewId}/report:
 *   post:
 *     summary: Report a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review reported successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */
router.post('/venue/:reviewId/report', protect, reviewController.reportReview);

export default router; 