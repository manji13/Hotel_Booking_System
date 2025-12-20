import { Stripe } from 'stripe';
import Booking from '../Model/BookingModel.js';
import Room from '../Model/roomModel.js';
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// --- HELPER: Check Overlapping Bookings ---
const getOverlappingBookingsCount = async (roomId, checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  const count = await Booking.countDocuments({
    roomId: roomId,
    bookingStatus: 'confirmed',
    'stayDetails.checkIn': { $lt: end }, // Booking starts before requested end
    'stayDetails.checkOut': { $gt: start } // Booking ends after requested start
  });
  return count;
};

// --- 0. NEW: Check Availability for specific dates (Used by Booking Page) ---
export const checkRoomAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    
    // Fetch all rooms
    const rooms = await Room.find();

    if (!checkIn || !checkOut) {
      // If no dates selected, just return rooms with their default capacity
      return res.json(rooms);
    }

    // Calculate dynamic availability for each room
    const availableRooms = await Promise.all(rooms.map(async (room) => {
      const bookedCount = await getOverlappingBookingsCount(room._id, checkIn, checkOut);
      // We assume room.availableCount in DB represents TOTAL PHYSICAL CAPACITY
      const currentAvailable = room.availableCount - bookedCount;
      
      return {
        ...room.toObject(),
        availableCount: currentAvailable > 0 ? currentAvailable : 0
      };
    }));

    res.json(availableRooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check availability' });
  }
};

// --- 1. Create Payment Intent (Updated Validation) ---
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, roomId, customerInfo, checkIn, checkOut } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(roomId)) return res.status(400).json({ error: 'Invalid Room ID' });
    
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    // Validate Date-Based Availability
    if (checkIn && checkOut) {
        const bookedCount = await getOverlappingBookingsCount(roomId, checkIn, checkOut);
        const currentAvailable = room.availableCount - bookedCount;
        
        if (currentAvailable < 1) {
             return res.status(400).json({ error: 'Room is sold out for these dates' });
        }
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

// --- 2. Confirm Booking (FIXED: Does not permanently reduce stock) ---
export const confirmBooking = async (req, res) => {
  try {
    const { paymentIntentId, roomId, checkIn, checkOut, guests, customerInfo, totalAmount, userId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ error: 'Payment not completed' });
    }

    const booking = new Booking({
      userId,
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

    // REMOVED: Room.findByIdAndUpdate logic. 
    // We now rely on Date overlap checks to determine availability.

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
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// --- 4. Get User Bookings ---
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

// --- 6. Delete Booking (FIXED: Does not permanently increase stock) ---
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
    }

    // REMOVED: Room.findByIdAndUpdate logic.
    // Stock is restored automatically because the Booking record is gone/cancelled.

    await Booking.findByIdAndDelete(req.params.id);

    res.json({ message: 'Booking deleted' });
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