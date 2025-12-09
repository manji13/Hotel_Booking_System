import { Stripe } from 'stripe';
import Booking from '../Model/BookingModel.js';
import Room from '../Model/roomModel.js';
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// --- 1. Create Payment Intent ---
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, roomId, checkIn, checkOut, guests, customerInfo } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(roomId)) return res.status(400).json({ error: 'Invalid Room ID' });
    
    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    // SAFETY CHECK: Double check availability before taking payment
    if (room.availableCount < 1) {
        return res.status(400).json({ error: 'Room is sold out' });
    }

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

// --- 2. Confirm Booking (AND DECREASE COUNT) ---
export const confirmBooking = async (req, res) => {
  try {
    const { paymentIntentId, roomId, checkIn, checkOut, guests, customerInfo, totalAmount } = req.body;

    // Verify Payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ error: 'Payment not completed' });
    }

    // Create the Booking Record
    const booking = new Booking({
      roomId, 
      customerInfo,
      stayDetails: { 
        checkIn: new Date(checkIn), 
        checkOut: new Date(checkOut), 
        guests, 
        nights: Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000) 
      },
      paymentInfo: { 
        paymentIntentId, 
        amount: totalAmount, 
        status: 'succeeded' 
      },
      bookingStatus: 'confirmed'
    });

    const savedBooking = await booking.save();

    // ---------------------------------------------------------
    // CRITICAL: DECREASE ROOM COUNT BY 1
    // ---------------------------------------------------------
    await Room.findByIdAndUpdate(roomId, { 
        $inc: { availableCount: -1 } 
    });
    // ---------------------------------------------------------

    res.json({ success: true, bookingId: savedBooking._id, message: 'Confirmed' });
  } catch (error) {
    console.error("Booking Confirmation Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// --- 3. Get All Bookings ---
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('roomId')
      .sort({ createdAt: -1 });
      
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// --- 4. Get Single Booking ---
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

// --- 5. Delete Booking ---
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// --- 6. Webhook Handler ---
export const handleWebhook = async (req, res) => {
  try {
    const event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};