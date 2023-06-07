import express from 'express';
import { protect, restrictTo } from '../controllers/authController.js';
import {
  getCheckoutSession,
  getAllBookings,
  updateBooking,
  deleteBooking,
  createBooking,
  getBooking
} from '../controllers/bookingController.js';

const router = express.Router();
router.use(protect);
router.get('/checkout-session/:tourID', getCheckoutSession);
router.use(restrictTo('admin', 'lead-guide'));
router
  .route('/')
  .get(getAllBookings)
  .post(createBooking);

router
  .route('/:id')
  .get(getBooking)
  .patch(updateBooking)
  .delete(deleteBooking);
export default router;
