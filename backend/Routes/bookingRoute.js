import express from 'express';
import {
  createPaymentIntent,
  confirmBooking,
  getBooking,
  getAllBookings,
  deleteBooking,
  handleWebhook
} from '../Controller/bookingController.js';

const router = express.Router();

// Webhook route (must be before body parser if you handle that in server.js, usually handled separately)
router.post('/webhook', express.raw({type: 'application/json'}), handleWebhook);

// Payment & Booking Routes
router.post('/create-payment-intent', createPaymentIntent);
router.post('/confirm-booking', confirmBooking);

// Data Retrieval Routes
router.get('/all-bookings', getAllBookings); // <--- Matches the exported function
router.get('/booking/:id', getBooking);
router.delete('/booking/:id', deleteBooking);

export default router;