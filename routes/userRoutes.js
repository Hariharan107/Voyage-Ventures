import express from 'express';
import {
  signup,
  login,
  resetPassword,
  updatePassword,
  forgotPassword,
  protect,
  restrictTo,
  logout
} from '../controllers/authController.js';

import {
  getAllUsers,
  uploadUserPhoto,
  getUser,
  createUser,
  updateUser,
  deleteMe,
  getMe,
  updateMe,
  resizeUserPhoto,
  deleteUser
} from '../controllers/userController.js';
const router = express.Router();
// You are not required to be logged to use these routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
// Protect all routes after this middleware
router.use(protect);
// TYou are required to be logged to use these routes
router.patch('/updateMyPassword', updatePassword);
router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete('/deleteMe', deleteMe);
router.get('/me', getMe);
// Only admin can use these routes
router.use(restrictTo('admin'));
router
  .route('/')
  .get(getAllUsers)
  .post(createUser);
router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

export default router;
