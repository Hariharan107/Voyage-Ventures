import { catchAsync } from '../utils/catchAsync.js';
import { User } from '../models/userModel.js';

// const users = await features.query;

// res.status(200).json({
//   status: 'success',
//   results: users.length,
//   data: {
//     users
//   }
// });
const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(201).json({
    status: 'success',
    users
  });
});

const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

export { getAllUsers, getUser, createUser, updateUser, deleteUser };
