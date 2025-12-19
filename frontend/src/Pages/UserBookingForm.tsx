import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, ArrowLeft, AlertOctagon, Calculator 
} from 'lucide-react';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { getStripe } from '../utils/stripe';
import { createPaymentIntent, confirmBooking } from '../service/paymentservice';
import UserNavbar from "../Header/UserNav";

interface Room {
  _id: string;
  roomType: string;
  images: string[];
  capacity: number;
  price: number;
  description: string;
  availableCount: number;
}

// --- Stripe Payment Form Sub-Component ---
const StripePaymentForm = ({ clientSecret, onPaymentSuccess, onPaymentError }: any) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.origin },
        redirect: 'if_required',
      });

      if (error) {
        setMessage(error.message || 'Payment failed');
        onPaymentError(error.message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setMessage('Payment successful!');
        onPaymentSuccess(paymentIntent.id);
      }
    } catch (err: any) {
      setMessage('Payment error');
      onPaymentError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="p-3 border bg-white rounded-lg"><PaymentElement /></div>
      {message && <div className="p-2 text-center bg-gray-100 text-sm">{message}</div>}
      <button disabled={!stripe || isProcessing} className="w-full bg-[#1a2b49] text-white py-3 rounded-lg hover:bg-[#2c436b] transition-colors">
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

// --- Main Page Component ---
const UserBookingForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const room = location.state?.room as Room;
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', country: '',
    checkIn: '', checkOut: '', guests: 1, paymentMethod: 'stripe'
  });

  const [clientSecret, setClientSecret] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  
  // Calculations
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [totalNights, setTotalNights] = useState(0);

  // Helper: Image URL
  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    return `http://localhost:5000${finalPath}`;
  };

  // Redirect if room is invalid
  useEffect(() => { 
    if (!room) {
        navigate('/booking');
    } else if (room.availableCount < 1) {
        const timer = setTimeout(() => navigate('/booking'), 3000);
        return () => clearTimeout(timer);
    }
  }, [room, navigate]);

  if (room && room.availableCount < 1) {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-4">
            <AlertOctagon className="w-20 h-20 text-red-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">Room Sold Out</h1>
            <p className="text-gray-600 mt-2">Redirecting you back...</p>
        </div>
    );
  }

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    if (name === 'checkIn') {
        if (formData.checkOut && value >= formData.checkOut) {
            setFormData(prev => ({ ...prev, [name]: value, checkOut: '' }));
            setClientSecret('');
            setCalculatedTotal(0);
            setTotalNights(0);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    } else if (name === 'checkOut') {
        if (formData.checkIn && value <= formData.checkIn) {
            alert("Check-out date must be after check-in date");
            return; 
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Initialize Payment Intent & Calculations
  useEffect(() => {
    if (formData.checkIn && formData.checkOut) {
      const start = new Date(formData.checkIn);
      const end = new Date(formData.checkOut);
      
      if (end > start) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        const total = room.price * nights;

        setTotalNights(nights);
        setCalculatedTotal(total);

        // Fetch Client Secret if email is present
        if (formData.email) {
            const initPayment = async () => {
                setIsLoading(true);
                try {
                    // Check for user login before creating intent (Optional but recommended)
                    const user = JSON.parse(localStorage.getItem('user') || '{}');
                    if (!user._id) return;

                    const data = await createPaymentIntent({
                        amount: total,
                        roomId: room._id,
                        checkIn: formData.checkIn,
                        checkOut: formData.checkOut,
                        guests: formData.guests,
                        customerInfo: formData
                    });
                    setClientSecret(data.clientSecret);
                } catch (err) {
                    console.error("Stripe Error", err);
                } finally {
                    setIsLoading(false);
                }
            };
            const debounce = setTimeout(initPayment, 500);
            return () => clearTimeout(debounce);
        }
      }
    }
  }, [formData.checkIn, formData.checkOut, formData.email, room]);

  // --- CRITICAL FIX: Handle Booking Confirmation ---
  const handleSuccess = async (paymentIntentId: string) => {
    try {
      // 1. Get logged-in user from LocalStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (!user._id) {
        alert("User session not found. Please log in.");
        navigate('/login');
        return;
      }

      const bookingPayload = {
        userId: user._id, // <--- FIX: Add userId here to satisfy Backend
        paymentIntentId,
        roomId: room._id,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: formData.guests,
        customerInfo: formData,
        totalAmount: calculatedTotal
      };

      const result = await confirmBooking(bookingPayload);
      
      setShowSuccess(true);
      setTimeout(() => {
        // Redirect to the User's Booking History or Details
        if (result.bookingId) navigate(`/booking-details/${result.bookingId}`);
        else navigate('/my-history');
      }, 2000);

    } catch (err: any) {
      console.error("Booking Confirmation Error:", err);
      setPaymentError(err.message || "Failed to save booking");
    }
  };

  if (!room) return null;

  if (showSuccess) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-10 bg-white rounded-xl shadow-lg">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4"/>
          <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
          <p>Redirecting to details...</p>
        </div>
      </div>
    );
  }

  const getMinCheckOutDate = () => {
      if (!formData.checkIn) return today;
      const date = new Date(formData.checkIn);
      date.setDate(date.getDate() + 1);
      return date.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <UserNavbar />
      <div className="max-w-4xl mx-auto pt-10 px-4">
        <button onClick={() => navigate(-1)} className="flex items-center mb-6 text-gray-600 hover:text-gray-900"><ArrowLeft className="mr-2"/> Back</button>
        
        <div className="grid md:grid-cols-2 gap-8">
            {/* LEFT COLUMN: FORM */}
            <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                <h2 className="text-xl font-bold mb-4">Guest Details</h2>
                <input name="firstName" placeholder="First Name" onChange={handleInputChange} className="w-full p-3 border rounded" />
                <input name="lastName" placeholder="Last Name" onChange={handleInputChange} className="w-full p-3 border rounded" />
                <input name="email" placeholder="Email" onChange={handleInputChange} className="w-full p-3 border rounded" />
                <input name="phone" placeholder="Phone" onChange={handleInputChange} className="w-full p-3 border rounded" />
                <input name="country" placeholder="Country" onChange={handleInputChange} className="w-full p-3 border rounded" />

                <div className="flex gap-4">
                    <div className="w-1/2">
                        <label className="text-sm text-gray-500 font-medium mb-1 block">Check In</label>
                        <input type="date" name="checkIn" min={today} value={formData.checkIn} onChange={handleInputChange} className="w-full p-3 border rounded" />
                    </div>
                    <div className="w-1/2">
                        <label className="text-sm text-gray-500 font-medium mb-1 block">Check Out</label>
                        <input type="date" name="checkOut" disabled={!formData.checkIn} min={getMinCheckOutDate()} value={formData.checkOut} onChange={handleInputChange} className={`w-full p-3 border rounded ${!formData.checkIn ? 'bg-gray-100' : ''}`} />
                    </div>
                </div>

                {room.availableCount <= 2 && (
                    <div className="mt-2 p-3 bg-orange-50 border border-orange-200 text-orange-700 rounded text-sm font-medium">
                        🔥 Hurry! Only {room.availableCount} room(s) left.
                    </div>
                )}

                {clientSecret && (
                    <div className="mt-6 border-t pt-6">
                        <h3 className="font-bold mb-4">Payment</h3>
                        <Elements stripe={getStripe()} options={{ clientSecret }}>
                            <StripePaymentForm clientSecret={clientSecret} onPaymentSuccess={handleSuccess} onPaymentError={(err: string) => setPaymentError(err)} />
                        </Elements>
                    </div>
                )}
                {paymentError && <div className="text-red-500 text-sm mt-2">{paymentError}</div>}
            </div>

            {/* RIGHT COLUMN: ROOM INFO & CALCULATOR */}
            <div className="h-fit space-y-6">
                
                {/* 1. Room Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <img 
                      src={getImageUrl(room.images[0])} 
                      alt="Room" 
                      className="w-full h-48 object-cover rounded mb-4 bg-gray-100"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                    />
                    <h2 className="text-xl font-bold">{room.roomType}</h2>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-3">{room.description}</p>
                    <div className="text-2xl font-bold text-[#1a2b49]">${room.price} <span className="text-sm font-normal text-gray-500">/ night</span></div>
                </div>

                {/* 2. Bill Summary Calculation */}
                {totalNights > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                            <Calculator size={18} className="text-blue-600"/> 
                            Bill Summary
                        </h3>
                        
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>{room.roomType} x {totalNights} nights</span>
                                <span>${room.price * totalNights}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Cleaning Fee</span>
                                <span>$0.00</span>
                            </div>
                            <div className="h-px bg-gray-200 my-2"></div>
                            <div className="flex justify-between text-lg font-bold text-[#1a2b49]">
                                <span>Total</span>
                                <span>${calculatedTotal}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserBookingForm;