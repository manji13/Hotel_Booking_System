import { Stripe } from 'stripe';
import Booking from '../Model/BookingModel.js';
import Room from '../Model/roomModel.js';
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// --- 1. Create Payment Intent ---
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, roomId, customerInfo } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(roomId)) return res.status(400).json({ error: 'Invalid Room ID' });
    
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

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

// --- 2. Confirm Booking (UPDATED WITH USER ID) ---
export const confirmBooking = async (req, res) => {
  try {
    // Note: userId is now destructured from the request body
    const { paymentIntentId, roomId, checkIn, checkOut, guests, customerInfo, totalAmount, userId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ error: 'Payment not completed' });
    }

    const booking = new Booking({
      userId, // <--- SAVING THE USER ID
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

    await Room.findByIdAndUpdate(roomId, { 
        $inc: { availableCount: -1 } 
    });

    res.json({ success: true, bookingId: savedBooking._id, message: 'Confirmed' });
  } catch (error) {
    console.error("Booking Confirmation Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// --- 3. Get All Bookings (For Employees/Admin) ---
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('roomId')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// --- 4. NEW: Get Only Specific User Bookings ---
export const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ userId: userId })
      .populate('roomId')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user bookings' });
  }
};

// --- 5. Get Single Booking ---
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

// --- 6. Delete Booking (Restock Logic) ---
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.roomId) {
        await Room.findByIdAndUpdate(booking.roomId, { 
            $inc: { availableCount: 1 } 
        });
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.json({ message: 'Booking deleted and Room stock restored' });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// --- 7. Webhook ---
export const handleWebhook = async (req, res) => {
  try {
    const event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};