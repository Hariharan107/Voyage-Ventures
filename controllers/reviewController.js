import { Review } from '../models/reviewModel.js';
import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

const getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({});
  res.status(200).json({
    status: 'Success',
    results: reviews
  });
});
const createReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create(req.body);
  console.log(req.body);
  console.log({ newReview });
  res.status(200).json({
    status: 'Success',
    review: newReview
  });
});
export { getAllReviews, createReview };
