import express from 'express';
import { protect, restrictTo } from '../controllers/authController.js';
import {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  getReview,
  setTourUserIds
} from '../controllers/reviewController.js';
const router = express.Router({ mergeParams: true });
router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), setTourUserIds, createReview);
router
  .route('/:id')
  .delete(deleteReview)
  .get(getReview)
  .patch(updateReview);
export default router;
