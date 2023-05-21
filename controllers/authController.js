import { User } from '../models/userModel.js';
import { promisify } from 'util';
import { catchAsync } from '../utils/catchAsync.js';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import AppError from '../utils/appError.js';
import { sendEmail } from '../utils/email.js';
import crypto from 'crypto';
dotenv.config();
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
    // secure: true
  };
  res.cookie('jwt', token, cookieOptions);
  //Remove password from output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};
const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
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
  if (role === 'admin' || role === 'lead-guide') {
    return next(
      new AppError('You are not authorised to be admin or lead-guide', 401)
    );
  }
  const newUser = await User.create({
    name,
    email,
    password,
    role,
    passwordConfirm,
    passwordChangedAt
  });
  createSendToken(newUser, 201, res);
  // const token = signToken(newUser._id);
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
  createSendToken(user, 200, res);
});

const protect = catchAsync(async (req, res, next) => {
  //Check whether token is present or not
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  //Verify the token
  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // console.log({decoded})
    // {decoded} contains decoded: { id: '6436d076cf69a4cfbac20653', iat: 1681316126, exp: 1681748126 }

    //Make the token invalid after the user deletes the account
    const currentUser = await User.findById(decoded.id);

    // console.log(currentUser);

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
    res.locals.user = currentUser;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired. Please log in again.', 401));
    } else {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
  }
  next();
});
//Only for rendered pages, no errors!
const isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};
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
//UPDATE PASSWORD
const updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  // const user1 = await User.findById(req.user.id)
  // console.log(user1);
  //console.log(answer for user1)
  // {
  //   _id: new ObjectId("6436d076cf69a4cfbac20653"),
  //   name: 'krish',
  //   email: 'krish@gmail.com',
  //   role: 'lead-guide',
  //   __v: 0,
  //   passwordChangedAt: 2023-04-12T16:03:52.638Z
  // }
  const user = await User.findById(req.user._id).select('+password');
  //Gets particular user document  and fetches password from it

  //2) Check if POSTed  current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  //3) If so,update password

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //4) Log user in,send JWT

  //4) Log user in,send JWT
  createSendToken(user, 200, res);
});

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
      email: email || user.email,
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
// RESET PASSWORD
const resetPassword = catchAsync(async (req, res, next) => {
  {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    // console.log(hashedToken);
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    //If token has expired, or there is no user, return error
    console.log(hashedToken, user);
    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }
    // 2) If token has not expired, and there is user, set the new password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    // console.log(user.password, user.passwordConfirm);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    createSendToken(yser, 200, res);
  }
});
export {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  isLoggedIn,
  logout,
  updatePassword
};
