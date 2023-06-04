import express from 'express';
import {
  getAllTours,
  getTour,
  getMonthlyPlan,
  createTour,
  updateTour,
  deleteTour,
  getTourStats,
  aliasTopTours,
  getDistances,
  uploadTourImages,
  resizeTourImages,
  getToursWithin
} from '../controllers/tourController.js';
import ReviewRouter from './reviewRoutes.js';
import { protect, restrictTo } from '../controllers/authController.js';
const router = express.Router();
//Get tour stats
router.route('/get-TourStats').get(getTourStats);
router
  .route('/get-monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);
router.route('/top-5-best').get(aliasTopTours, getAllTours);
//Nested route
router.use('/:tourId/reviews', ReviewRouter); //nested route. First route will give the params which is ToursId to the second route

//GeoSpatial route
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);
router.route('/distance/:latlng/unit/:unit').get(getDistances);

//Tour routes
router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

export default router;
