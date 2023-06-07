import axios from 'axios';
import { showAlert } from './alerts';
// import Stripe from 'stripe';

const stripe = Stripe(
  'pk_test_51NFwotSIH8fieRDzRkcDSuUbZTeeCxLIqZWZj6Ip09OND3bfRMlU8VkLdByiAIb8r0TKrN1eFtj0H82CS7osf6gV004ZTnI2R6'
);

const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);
    // await stripe.redirectToCheckout({
    //   sessionId: session.data.session.id
    // });
    // console.log(session.data.session.url);
    const stripeUrl = await session.data.session.url;
    window.location.href = stripeUrl;
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
export { bookTour };
