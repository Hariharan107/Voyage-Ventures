import { Tour } from '../models/tourModel.js';
import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
const getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});
const getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // 2) Build template
  // 3) Render template using data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
});

const loginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Login to your account'
  });
});
const getSingupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'create your account!'
  });
};
const getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};
export { getOverview, getTour, loginForm, getAccount, getSingupForm };
