import express from 'express';
import { protect, restrictTo } from '../controllers/authController.js';
import {
  getAllReviews,
  createReview
} from '../controllers/reviewController.js';
const router = express.Router({ mergeParams: true });
router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), createReview);

export default router;
