import express from 'express';
import {
  createPaymentIntent,
  confirmBooking,
  getBooking,
  getAllBookings, // <--- Import this
  deleteBooking,
  handleWebhook
} from '../Controller/paymentController.js';

const router = express.Router();

router.post('/webhook', express.raw({type: 'application/json'}), handleWebhook);
router.post('/create-payment-intent', createPaymentIntent);
router.post('/confirm-booking', confirmBooking);

router.get('/all-bookings', getAllBookings); // <--- Add this new route
router.get('/booking/:id', getBooking);
router.delete('/booking/:id', deleteBooking);

export default router;