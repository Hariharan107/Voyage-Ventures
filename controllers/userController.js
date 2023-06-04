import { catchAsync } from '../utils/catchAsync.js';
import { User } from '../models/userModel.js';
import AppError from '../utils/appError.js';
import multer from 'multer';
import { deleteOne, getAll, getOne, updateOne } from './handleFactory.js';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as fs from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// const users = await features.query;

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user._id}-${req.user.name}.${ext}`);
//   }
// });

const multerStorage = multer.memoryStorage();
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

const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user._id}-${req.user.name}.jpeg`;
  const resizedFile = await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 });
  await resizedFile.toFile(`public/img/users/${req.file.filename}`);
  next();
});

//Update user data
const updateMe = catchAsync(async (req, res, next) => {
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
  // if (req.file) await deletePhotoFromServer(req.user.photo);
  if (req.file) user.photo = req.file.filename;
  await user.save({ validateModifiedOnly: true });

  res.status(200).json({
    status: 'success',
    user: user
  });
});
// Create user is not defined
const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'The route is not yet defined.Please use /signup instead '
  });
};
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
const deletePhotoFromServer = async photo => {
  const path = `${__dirname}/../public/img/users/${photo}`;
  await fs.promises.unlink(path, err => {
    if (err) return console.log(err);
    console.log('Previous photo has been deleted');
  });
};
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
  resizeUserPhoto,
  uploadUserPhoto,
  getMe
};
