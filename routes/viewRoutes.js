import express from 'express';
import {
  getTour,
  getOverview,
  loginForm
} from '../controllers/viewController.js';
import { isLoggedIn } from '../controllers/authController.js';
const router = express.Router();
router.use(isLoggedIn);
router.route('/').get(getOverview);
router.route('/login').get(loginForm);
router.route('/tour/:slug').get(getTour);
export default router;
