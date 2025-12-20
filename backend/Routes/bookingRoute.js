import express from 'express';
import {
  createPaymentIntent,
  confirmBooking,
  getBooking,
  getAllBookings,
  getUserBookings,
  deleteBooking,
  handleWebhook,
  checkRoomAvailability // <--- Import New Function
} from '../Controller/bookingController.js';

const router = express.Router();

router.post('/webhook', express.raw({type: 'application/json'}), handleWebhook);

router.post('/create-payment-intent', createPaymentIntent);
router.post('/confirm-booking', confirmBooking);

router.get('/availability', checkRoomAvailability); // <--- NEW Route for searching rooms by date
router.get('/all-bookings', getAllBookings); 
router.get('/user/:userId', getUserBookings);
router.get('/booking/:id', getBooking);
router.delete('/booking/:id', deleteBooking);

export default router;