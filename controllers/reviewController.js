import { Review } from '../models/reviewModel.js';
// import { catchAsync } from '../utils/catchAsync.js';
// import AppError from '../utils/appError.js';
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne
} from './handleFactory.js';
import { createTestAccount } from 'nodemailer';

const setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
const createReview = createOne(Review);
const getReview = getOne(Review);
const getAllReviews = getAll(Review);
const updateReview = updateOne(Review);
const deleteReview = deleteOne(Review);
export {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  getReview,
  setTourUserIds
};
