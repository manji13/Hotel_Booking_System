import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, User, Mail, Phone, Globe, CreditCard, Shield, CheckCircle, ArrowLeft, Loader 
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
}

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
      <button disabled={!stripe || isProcessing} className="w-full bg-[#1a2b49] text-white py-3 rounded-lg">
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

const UserBookingForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const room = location.state?.room as Room;

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', country: '',
    checkIn: '', checkOut: '', guests: 1, paymentMethod: 'stripe'
  });

  const [clientSecret, setClientSecret] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => { if (!room) navigate('/booking'); }, [room, navigate]);

  const handleInputChange = (e: any) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Initialize Payment Intent
  useEffect(() => {
    if (formData.checkIn && formData.checkOut && formData.email) {
      const initPayment = async () => {
        setIsLoading(true);
        try {
            const nights = Math.ceil((new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (86400000));
            const total = room.price * (nights > 0 ? nights : 1);
            
            const data = await createPaymentIntent({
                amount: total,
                roomId: room._id,
                checkIn: formData.checkIn,
                checkOut: formData.checkOut,
                guests: formData.guests,
                customerInfo: formData
            });
            setClientSecret(data.clientSecret);
        } catch (err: any) {
            console.error("Stripe Init Error:", err);
        } finally {
            setIsLoading(false);
        }
      };
      initPayment();
    }
  }, [formData.checkIn, formData.checkOut, formData.email]);

  // Handle Success
  const handleSuccess = async (paymentIntentId: string) => {
    try {
      const nights = Math.ceil((new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (86400000));
      const totalAmount = room.price * (nights > 0 ? nights : 1);

      const bookingPayload = {
        paymentIntentId,
        roomId: room._id,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: formData.guests,
        customerInfo: formData,
        totalAmount
      };

      console.log("Sending to Backend:", bookingPayload);
      const result = await confirmBooking(bookingPayload);
      console.log("Backend Response:", result);
      
      setShowSuccess(true);

      setTimeout(() => {
        if (result.bookingId) {
            navigate(`/booking-details/${result.bookingId}`);
        } else {
            console.error("Missing Booking ID in response");
            navigate('/booking');
        }
      }, 2000);

    } catch (err: any) {
      setPaymentError(err.message);
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

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <UserNavbar />
      <div className="max-w-4xl mx-auto pt-10 px-4">
        <button onClick={() => navigate(-1)} className="flex items-center mb-6 text-gray-600"><ArrowLeft className="mr-2"/> Back</button>
        
        <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                <h2 className="text-xl font-bold mb-4">Guest Details</h2>
                <input name="firstName" placeholder="First Name" onChange={handleInputChange} className="w-full p-3 border rounded" />
                <input name="lastName" placeholder="Last Name" onChange={handleInputChange} className="w-full p-3 border rounded" />
                <input name="email" placeholder="Email" onChange={handleInputChange} className="w-full p-3 border rounded" />
                <input name="phone" placeholder="Phone" onChange={handleInputChange} className="w-full p-3 border rounded" />
                
                {/* --- THIS WAS MISSING --- */}
                <input name="country" placeholder="Country" onChange={handleInputChange} className="w-full p-3 border rounded" />
                {/* ------------------------ */}

                <div className="flex gap-4">
                    <div className="w-1/2">
                        <label className="text-sm text-gray-500">Check In</label>
                        <input type="date" name="checkIn" onChange={handleInputChange} className="w-full p-3 border rounded" />
                    </div>
                    <div className="w-1/2">
                        <label className="text-sm text-gray-500">Check Out</label>
                        <input type="date" name="checkOut" onChange={handleInputChange} className="w-full p-3 border rounded" />
                    </div>
                </div>

                {clientSecret && (
                    <div className="mt-6 border-t pt-6">
                        <h3 className="font-bold mb-4">Payment</h3>
                        <Elements stripe={getStripe()} options={{ clientSecret }}>
                            <StripePaymentForm 
                                clientSecret={clientSecret} 
                                onPaymentSuccess={handleSuccess}
                                onPaymentError={(err: string) => setPaymentError(err)}
                            />
                        </Elements>
                    </div>
                )}
                {paymentError && <div className="text-red-500 text-sm mt-2">{paymentError}</div>}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm h-fit">
                <img src={room.images[0] || ""} alt="Room" className="w-full h-48 object-cover rounded mb-4"/>
                <h2 className="text-xl font-bold">{room.roomType}</h2>
                <p className="text-gray-500 text-sm mb-4">{room.description}</p>
                <div className="text-2xl font-bold text-[#1a2b49]">${room.price} <span className="text-sm font-normal text-gray-500">/ night</span></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserBookingForm;