import { Review } from '../models/reviewModel.js';
import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

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
const createReview = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.toursId;
  console.log(req.params.toursId);
  req.body.user = req.user.id;
  const newReview = await Review.create(req.body);
  console.log(req.body);
  console.log({ newReview });
  res.status(200).json({
    status: 'Success',
    review: newReview
  });
});
export { getAllReviews, createReview };
