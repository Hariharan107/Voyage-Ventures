import express from 'express';
import {
  getTour,
  getOverview,
  loginForm
} from '../controllers/viewController.js';
// import { protect } from '../controllers/authController.js';
const router = express.Router();

router.route('/').get(getOverview);
router.route('/login').get(loginForm);
router.route('/tour/:slug').get(getTour);
export default router;
