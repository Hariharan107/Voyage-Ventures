import { User } from '../models/userModel.js';
import { promisify } from 'util';
import { catchAsync } from '../utils/catchAsync.js';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import AppError from '../utils/appError.js';
import { sendEmail } from '../utils/email.js';

dotenv.config();
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};
const signup = catchAsync(async (req, res, next) => {
  const {
    name,
    email,
    password,
    passwordConfirm,
    passwordChangedAt,
    role
  } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    role,
    passwordConfirm,
    passwordChangedAt
  });
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email,password', 400));
  }
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // console.log(user);
  const token = signToken(user.id);
  res.status(200).json({
    status: 'success',
    token
  });
});

const protect = catchAsync(async (req, res, next) => {
  //Check whether token is present or not
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  //Verify the token
  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //Make the token invalid after the user deletes the account
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token no longer exists', 401)
      );
    }

    //Check if user changed his password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          'User recently changed password! Please log in again.',
          401
        )
      );
    }
    //Grant access to protected route
    req.user = currentUser;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired. Please log in again.', 401));
    } else {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
  }

  next();
});
//AUTHORIZATION
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
//FORGOT PASSWORD
const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateModifiedOnly: true });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateModifiedOnly: true });
    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  {
  }
});
export { signup, login, protect, restrictTo, forgotPassword, resetPassword };
