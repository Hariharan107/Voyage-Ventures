import express from 'express';
import AppError from '../utils/appError.js';
import {
  getTour,
  getOverview,
  loginForm,
  getAccount
} from '../controllers/viewController.js';
import { isLoggedIn, protect } from '../controllers/authController.js';
const router = express.Router();

router.route('/').get(isLoggedIn,getOverview);
router.route('/login').get(isLoggedIn,loginForm);
router.route('/tour/:slug').get(isLoggedIn,getTour);
router.route('/me').get(protect, getAccount);

export default router;
