import express from 'express';
import {
  getAllTours,
  getTour,
  getMonthlyPlan,
  createTour,
  updateTour,
  deleteTour,
  getTourStats,
  aliasTopTours
} from '../controllers/tourController.js';
import ReviewRouter from './reviewRoutes.js';
import { protect, restrictTo } from '../controllers/authController.js';
const router = express.Router();
router.route('/get-TourStats').get(getTourStats);
router.route('/get-monthly-plan/:year').get(getMonthlyPlan);
router.route('/top-5-best').get(aliasTopTours, getAllTours);

router.use('/:tourId/reviews', ReviewRouter); //nested route. First route will give the params which is ToursId to the second route
router
  .route('/')
  .get(protect, getAllTours)
  .post(createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

export default router;
