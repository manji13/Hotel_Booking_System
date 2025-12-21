import express from 'express';
import {
  createPaymentIntent,
  confirmBooking,
  getBooking,
  getAllBookings,
  getUserBookings,
  deleteBooking,
  handleWebhook,
  checkRoomAvailability,
  getBookingStats // <--- New Import
} from '../Controller/bookingController.js';

const router = express.Router();

router.post('/webhook', express.raw({type: 'application/json'}), handleWebhook);

router.post('/create-payment-intent', createPaymentIntent);
router.post('/confirm-booking', confirmBooking);

// Stats Route (Matches /api/payments/booking-stats in server.js)
router.get('/booking-stats', getBookingStats); 

router.get('/availability', checkRoomAvailability); 
router.get('/all-bookings', getAllBookings); 
router.get('/user/:userId', getUserBookings);
router.get('/booking/:id', getBooking);
router.delete('/booking/:id', deleteBooking); // This now triggers Soft Delete

export default router;