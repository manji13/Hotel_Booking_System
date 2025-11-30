import express from 'express';
import {
  createPaymentIntent,
  confirmBooking,
  getBooking,
  handleWebhook
} from '../Controller/paymentController.js';

const router = express.Router();

// Webhook route must be before body parser
router.post('/webhook', express.raw({type: 'application/json'}), handleWebhook);

// Other routes
router.post('/create-payment-intent', createPaymentIntent);
router.post('/confirm-booking', confirmBooking);
router.get('/booking/:id', getBooking);

export default router;