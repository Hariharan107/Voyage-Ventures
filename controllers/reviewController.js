import { Review } from '../models/reviewModel.js';
import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { createOne, deleteOne, updateOne } from './handleFactory.js';
import { createTestAccount } from 'nodemailer';

const getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const reviews = await Review.find(filter);
  const length = reviews.length;
  res.status(200).json({
    status: 'Success',
    length,
    results: reviews
  });
});
const setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
const createReview = createOne(Review);
const updateReview = updateOne(Review);
const deleteReview = deleteOne(Review);
export {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds
};
