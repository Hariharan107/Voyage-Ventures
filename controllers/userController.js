import { catchAsync } from '../utils/catchAsync.js';
import { User } from '../models/userModel.js';
import AppError from '../utils/appError.js';
import multer from 'multer';
import { deleteOne, getAll, getOne, updateOne } from './handleFactory.js';
// const users = await features.query;

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user._id}-${req.user.name}.${ext}`);
  }
});
const multerFilter = (req, file, cb) => {
  //Check if file is an image
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image!Please upload only images', 400), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

const uploadUserPhoto = upload.single('photo');
const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'The route is not yet defined.Please use /signup instead '
  });
};
//Update user data
const updateMe = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  console.log(req.user);
  console.log(req.file);
  const { name, email } = req.body;
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
  if (req.file) user.photo = req.file.filename;
  // if (photo) user.photo = photo;

  console.log(user);
  await user.save({ validateModifiedOnly: true });

  res.status(200).json({
    status: 'success',
    user: user
  });
});
//Get current user
const getMe = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    user: req.user
  });
};
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
  deleteMe,
  uploadUserPhoto,
  getMe
};
