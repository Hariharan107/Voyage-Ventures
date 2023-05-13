import express from 'express';
import { protect, restrictTo } from '../controllers/authController.js';
import {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  getReview,
  setTourUserIds,
  checkIfAuthor
} from '../controllers/reviewController.js';
const router = express.Router({ mergeParams: true });

router.use(protect);
router
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourUserIds, createReview);
router
  .route('/:id')
  .get(getReview)
  .delete(restrictTo('admin', 'user'), checkIfAuthor, deleteReview)
  .patch(restrictTo('admin', 'user'), checkIfAuthor, updateReview);
export default router;
