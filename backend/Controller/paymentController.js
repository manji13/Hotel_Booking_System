import { Stripe } from 'stripe';
import Booking from '../Model/BookingModel.js';
import Room from '../Model/roomModel.js';
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ... (Keep createPaymentIntent, confirmBooking, deleteBooking, handleWebhook as they are) ...

// --- ADD THIS NEW FUNCTION ---
export const getAllBookings = async (req, res) => {
  try {
    // Fetch all bookings and populate room details
    // Sort by newest first (-1)
    const bookings = await Booking.find()
      .populate('roomId')
      .sort({ createdAt: -1 });
      
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// ... (Keep getBooking as it is) ...

// (Rest of your existing functions: createPaymentIntent, confirmBooking, deleteBooking, handleWebhook, getBooking)
// Just make sure getAllBookings is exported!

// ------------------------------------------------------------------
// FOR YOUR CONVENIENCE, HERE IS THE FULL FILE CONTENT IF YOU PREFER:
// ------------------------------------------------------------------

export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, roomId, checkIn, checkOut, guests, customerInfo } = req.body;
    if (!mongoose.Types.ObjectId.isValid(roomId)) return res.status(400).json({ error: 'Invalid Room ID' });
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: { roomId: String(roomId), customerEmail: customerInfo.email }
    });
    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const confirmBooking = async (req, res) => {
  try {
    const { paymentIntentId, roomId, checkIn, checkOut, guests, customerInfo, totalAmount } = req.body;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') return res.status(400).json({ error: 'Payment not completed' });
    const booking = new Booking({
      roomId, customerInfo,
      stayDetails: { checkIn: new Date(checkIn), checkOut: new Date(checkOut), guests, nights: Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000) },
      paymentInfo: { paymentIntentId, amount: totalAmount, status: 'succeeded' },
      bookingStatus: 'confirmed'
    });
    const savedBooking = await booking.save();
    res.json({ success: true, bookingId: savedBooking._id, message: 'Confirmed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBooking = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid ID' });
    const booking = await Booking.findById(req.params.id).populate('roomId');
    if (!booking) return res.status(404).json({ error: 'Not found' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};