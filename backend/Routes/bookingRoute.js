import express from 'express';
import {
  createPaymentIntent,
  confirmBooking,
  getBooking,
  getAllBookings,
  getUserBookings, // <--- Import this
  deleteBooking,
  handleWebhook
} from '../Controller/bookingController.js';

const router = express.Router();

router.post('/webhook', express.raw({type: 'application/json'}), handleWebhook);

router.post('/create-payment-intent', createPaymentIntent);
router.post('/confirm-booking', confirmBooking);

router.get('/all-bookings', getAllBookings); // Admin/Employee
router.get('/user/:userId', getUserBookings); // <--- NEW Route for User History
router.get('/booking/:id', getBooking);
router.delete('/booking/:id', deleteBooking);

export default router;