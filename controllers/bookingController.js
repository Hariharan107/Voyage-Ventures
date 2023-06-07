import Stripe from 'stripe'; // Change import to use named import
import { catchAsync } from '../utils/catchAsync.js';
import { Tour } from '../models/tourModel.js';
import { Booking } from '../models/bookingModels.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Create an instance of Stripe

const getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourID);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourID
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'inr',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`]
          }
        }
      }
    ]
  });
  res.status(200).json({
    status: 'success',
    session
  });
});
const createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour || !user || !price) {
    return next();
  }
  await Booking.create({ tour, user, price });
  next();
  res.redirect(req.originalUrl.split('?')[0]);
});
export { getCheckoutSession, createBookingCheckout };
