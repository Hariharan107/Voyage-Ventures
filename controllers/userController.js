import { catchAsync } from '../utils/catchAsync.js';
import { User } from '../models/userModel.js';
import AppError from '../utils/appError.js';
import { deleteOne, getAll, getOne, updateOne } from './handleFactory.js';
// const users = await features.query;

// res.status(200).json({
//   status: 'success',
//   results: users.length,
//   data: {
//     users
//   }
// });
const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'The route is not yet defined.Please use /signup instead '
  });
};
//Update user data
const updateMe = catchAsync(async (req, res, next) => {
  const { name, email, photo } = req.body;
  //Make sure that user is not updating password in this route
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates.Please use /updateMyPassword route ',
        400
      )
    );
  }
  //Just update the modified fields
  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (email) user.email = email;
  if (photo) user.photo = photo;
  console.log(user);
  await user.save({ validateModifiedOnly: true });

  res.status(200).json({
    status: 'success',
    user: user
  });
});
//Delete User
const deleteMe = catchAsync(async (req, res, next) => {
  const { _id: user } = req.user;
  // const user = await User.findById(_id);
  await User.findByIdAndDelete(user);
  res.status(200).json({
    status: 'success',
    message: 'Your account has been deleted'
  });
});

const getUser = getOne(User);
const getAllUsers = getAll(User);
const updateUser = updateOne(User);
const deleteUser = deleteOne(User);

export {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe
};
