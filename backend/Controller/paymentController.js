import { Stripe } from 'stripe';
import Booking from '../Model/BookingModel.js';
import Room from '../Model/roomModel.js';

// Initialize Stripe ONLY if key exists to prevent crashing immediately on import
// The server.js fix ensures this is available, but this is a good safety practice.
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
    console.error("CRITICAL ERROR: Stripe Key is missing in paymentController!");
}
const stripe = new Stripe(stripeKey || 'dummy_key_to_prevent_crash'); 

// Create Payment Intent
export const createPaymentIntent = async (req, res) => {
  try {
    const {
      amount,
      roomId,
      checkIn,
      checkOut,
      guests,
      customerInfo
    } = req.body;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        roomId: String(roomId),
        checkIn,
        checkOut,
        guests: String(guests),
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        customerEmail: customerInfo.email
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Failed to create payment intent: ${error.message}` });
  }
};

// Confirm Booking
export const confirmBooking = async (req, res) => {
  try {
    const {
      paymentIntentId,
      roomId,
      checkIn,
      checkOut,
      guests,
      customerInfo,
      totalAmount
    } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    const booking = new Booking({
      roomId,
      customerInfo,
      stayDetails: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        nights
      },
      paymentInfo: {
        paymentIntentId,
        amount: totalAmount,
        status: 'succeeded'
      },
      bookingStatus: 'confirmed'
    });

    await booking.save();
    await booking.populate('roomId');

    res.json({
      success: true,
      bookingId: booking._id,
      message: 'Booking confirmed successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Failed to confirm booking: ${error.message}` });
  }
};

// Get Booking
export const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('roomId');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

// Handle Webhooks
export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await Booking.findOneAndUpdate(
          { 'paymentInfo.paymentIntentId': event.data.object.id },
          { 'paymentInfo.status': 'succeeded', bookingStatus: 'confirmed' }
        );
        break;

      case 'payment_intent.payment_failed':
        await Booking.findOneAndUpdate(
          { 'paymentInfo.paymentIntentId': event.data.object.id },
          { 'paymentInfo.status': 'failed', bookingStatus: 'cancelled' }
        );
        break;
    }

    res.json({ received: true });

  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};