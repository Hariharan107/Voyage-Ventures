import express from 'express';
import { getTour, getOverview } from '../controllers/viewController.js';
const router = express.Router();

router.route('/').get(getOverview);
router.route('/tour').get(getTour);
export default router;
