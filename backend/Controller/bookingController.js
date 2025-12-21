import { Stripe } from 'stripe';
import Booking from '../Model/BookingModel.js';
import Room from '../Model/roomModel.js';
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// --- HELPER: Check Overlapping Bookings ---
const getOverlappingBookingsCount = async (roomId, checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  // We only count CONFIRMED bookings as taking up physical space.
  // 'cancelled' bookings are ignored here, so the room becomes available again for others.
  const count = await Booking.countDocuments({
    roomId: roomId,
    bookingStatus: 'confirmed', 
    'stayDetails.checkIn': { $lt: end },
    'stayDetails.checkOut': { $gt: start }
  });
  return count;
};

// --- NEW: Get Booking Statistics (For Chart) ---
export const getBookingStats = async (req, res) => {
  try {
    const { type } = req.query; // 'daily' or 'monthly'

    let dateFormat;
    if (type === 'monthly') {
      dateFormat = '%Y-%m'; // e.g., 2024-01
    } else {
      dateFormat = '%Y-%m-%d'; // e.g., 2024-01-01
    }

    const stats = await Booking.aggregate([
      {
        // 1. MATCH EVERYTHING: We do NOT filter by status.
        // We include 'confirmed', 'pending', AND 'cancelled' so the chart shows history.
        $match: {} 
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          count: { $sum: 1 } // Count how many bookings were made on this date
        }
      },
      { $sort: { _id: 1 } } // Sort Oldest -> Newest
    ]);

    const formattedStats = stats.map(item => ({
      name: item._id,
      bookings: item.count
    }));

    res.json(formattedStats);
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

// --- Check Availability ---
export const checkRoomAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    const rooms = await Room.find();

    if (!checkIn || !checkOut) return res.json(rooms);

    const availableRooms = await Promise.all(rooms.map(async (room) => {
      const bookedCount = await getOverlappingBookingsCount(room._id, checkIn, checkOut);
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

// --- Create Payment Intent ---
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, roomId, customerInfo, checkIn, checkOut } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(roomId)) return res.status(400).json({ error: 'Invalid Room ID' });
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    if (checkIn && checkOut) {
        const bookedCount = await getOverlappingBookingsCount(roomId, checkIn, checkOut);
        const currentAvailable = room.availableCount - bookedCount;
        if (currentAvailable < 1) return res.status(400).json({ error: 'Room is sold out for these dates' });
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

// --- Confirm Booking ---
export const confirmBooking = async (req, res) => {
  try {
    const { paymentIntentId, roomId, checkIn, checkOut, guests, customerInfo, totalAmount, userId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') return res.status(400).json({ error: 'Payment not completed' });

    const booking = new Booking({
      userId, roomId, customerInfo,
      stayDetails: { 
        checkIn: new Date(checkIn), 
        checkOut: new Date(checkOut), 
        guests, 
        nights: Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000) 
      },
      paymentInfo: { paymentIntentId, amount: totalAmount, status: 'succeeded' },
      bookingStatus: 'confirmed'
    });

    const savedBooking = await booking.save();
    res.json({ success: true, bookingId: savedBooking._id, message: 'Confirmed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- Get All Bookings ---
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('roomId').sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// --- Get User Bookings ---
export const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    // We fetch ALL bookings (active and cancelled) so user sees their history
    const bookings = await Booking.find({ userId: userId }).populate('roomId').sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user bookings' });
  }
};

// --- Get Single Booking ---
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

// --- 6. Delete Booking (UPDATED: SOFT DELETE) ---
// This allows the User to "delete" the booking, but we keep the record for the chart.
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // OLD CODE (Bad for charts): 
    // await Booking.findByIdAndDelete(req.params.id);

    // NEW CODE (Good for charts):
    // 1. Mark as cancelled
    booking.bookingStatus = 'cancelled';
    await booking.save();

    // 2. The record still exists, so 'getBookingStats' can count it.
    // 3. 'getOverlappingBookingsCount' ignores 'cancelled', so room is free for others.

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// --- Webhook ---
export const handleWebhook = async (req, res) => {
  try {
    const event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};