import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  CreditCard, 
  Shield,
  CheckCircle,
  ArrowLeft,
  Loader
} from 'lucide-react';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { getStripe } from '../utils/stripe';
import { createPaymentIntent, confirmBooking } from '../service/paymentservice';
import UserNavbar from "../Header/UserNav";

interface Room {
  _id: string;
  roomType: string;
  images: string[];
  beds: number;
  capacity: number;
  price: number;
  description: string;
}

interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  paymentMethod: 'stripe';
}

// Stripe Payment Form Component
const StripePaymentForm = ({ 
  clientSecret,
  onPaymentSuccess,
  onPaymentError 
}: { 
  clientSecret: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setMessage(error.message || 'An unexpected error occurred');
        onPaymentError(error.message || 'Payment failed');
      } else if (paymentIntent) {
        if (paymentIntent.status === 'succeeded') {
          setMessage('Payment successful!');
          onPaymentSuccess(paymentIntent.id);
        } else {
          setMessage(`Payment status: ${paymentIntent.status}`);
          onPaymentError(`Payment status: ${paymentIntent.status}`);
        }
      }
    } catch (error) {
      const errorMessage = 'Payment processing failed';
      setMessage(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="p-3 border border-gray-300 rounded-lg bg-white">
        <PaymentElement />
      </div>
      
      {message && (
        <div className={`p-3 rounded-lg text-center ${
          message.includes('successful') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}
      
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-[#1a2b49] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#2c4a7c] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
      >
        {isProcessing ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          'Pay Now'
        )}
      </button>
    </form>
  );
};

// Main Booking Form Component
const UserBookingForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const room = location.state?.room as Room;
  
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    paymentMethod: 'stripe'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string>('');

  // Redirect if no room data
  useEffect(() => {
    if (!room) {
      navigate('/booking');
    }
  }, [room, navigate]);

  // Calculate total price
  const calculateTotal = () => {
    if (!formData.checkIn || !formData.checkOut) return room?.price || 0;
    
    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return (room?.price || 0) * Math.max(nights, 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create payment intent when form is ready for Stripe payment
  useEffect(() => {
    if (formData.paymentMethod === 'stripe' && 
        formData.checkIn && 
        formData.checkOut &&
        formData.firstName &&
        formData.lastName &&
        formData.email &&
        formData.phone &&
        formData.country) {
      
      const createStripePaymentIntent = async () => {
        setIsLoading(true);
        setPaymentError('');

        try {
          const totalAmount = calculateTotal();
          const paymentData = {
            amount: totalAmount,
            roomId: room._id,
            checkIn: formData.checkIn,
            checkOut: formData.checkOut,
            guests: formData.guests,
            customerInfo: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              country: formData.country
            }
          };

          console.log('Creating payment intent with data:', paymentData);
          const { clientSecret } = await createPaymentIntent(paymentData);
          setClientSecret(clientSecret);
        } catch (error) {
          console.error('Failed to create payment intent:', error);
          setPaymentError(error instanceof Error ? error.message : 'Failed to initialize payment');
        } finally {
          setIsLoading(false);
        }
      };

      createStripePaymentIntent();
    }
  }, [formData, room?._id]);

  const handleStripePaymentSuccess = async (paymentIntentId: string) => {
    try {
      setIsSubmitting(true);
      const totalAmount = calculateTotal();
      
      const bookingData = {
        paymentIntentId,
        roomId: room._id,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: formData.guests,
        customerInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          country: formData.country
        },
        totalAmount
      };

      console.log('Confirming booking with data:', bookingData);
      const result = await confirmBooking(bookingData);
      setBookingId(result.bookingId);
      setShowSuccess(true);
      
      setTimeout(() => {
        navigate('/booking-success', { 
          state: { 
            bookingId: result.bookingId,
            room: room,
            bookingDetails: {
              ...formData,
              totalAmount,
              nights: Math.ceil((new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 60 * 60 * 24))
            }
          } 
        });
      }, 3000);
    } catch (error) {
      console.error('Booking confirmation failed:', error);
      setPaymentError(error instanceof Error ? error.message : 'Booking confirmation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStripePaymentError = (error: string) => {
    setPaymentError(error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');

    // For this implementation, we only support Stripe payments
    if (formData.paymentMethod !== 'stripe') {
      setPaymentError('Only Stripe payments are currently supported');
      return;
    }
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No room selected</p>
          <button 
            onClick={() => navigate('/booking')}
            className="bg-[#1a2b49] text-white px-6 py-2 rounded-lg hover:bg-[#2c4a7c] transition-colors"
          >
            Back to Rooms
          </button>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md w-full mx-4"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-4">
            Your booking for {room.roomType} has been successfully confirmed.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting you to booking details...
          </p>
        </motion.div>
      </div>
    );
  }

  const totalPrice = calculateTotal();
  const nights = formData.checkIn && formData.checkOut 
    ? Math.ceil((new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const isFormValid = () => {
    return formData.firstName &&
           formData.lastName &&
           formData.email &&
           formData.phone &&
           formData.country &&
           formData.checkIn &&
           formData.checkOut;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Rooms
        </button>

        {/* Payment Error Alert */}
        {paymentError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {paymentError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-[#1a2b49] text-white p-6">
                <h1 className="text-2xl font-bold">Complete Your Booking</h1>
                <p className="text-blue-100 mt-1">Fill in your details to confirm your stay</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Personal Information Section */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-[#1a2b49]" />
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a2b49] focus:border-transparent transition-all"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a2b49] focus:border-transparent transition-all"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a2b49] focus:border-transparent transition-all"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a2b49] focus:border-transparent transition-all"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Globe className="w-4 h-4 mr-1" />
                      Country *
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a2b49] focus:border-transparent transition-all"
                    >
                      <option value="">Select your country</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="JP">Japan</option>
                      <option value="SG">Singapore</option>
                    </select>
                  </div>
                </section>

                {/* Stay Details Section */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-[#1a2b49]" />
                    Stay Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-in Date *
                      </label>
                      <input
                        type="date"
                        name="checkIn"
                        value={formData.checkIn}
                        onChange={handleInputChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a2b49] focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-out Date *
                      </label>
                      <input
                        type="date"
                        name="checkOut"
                        value={formData.checkOut}
                        onChange={handleInputChange}
                        required
                        min={formData.checkIn || new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a2b49] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Guests *
                    </label>
                    <select
                      name="guests"
                      value={formData.guests}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a2b49] focus:border-transparent transition-all"
                    >
                      {Array.from({ length: room.capacity }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} Guest{i + 1 > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </section>

                {/* Payment Method Section */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-[#1a2b49]" />
                    Payment Method
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {[
                      { value: 'stripe', label: 'Credit/Debit Card', icon: CreditCard },
                      { value: 'paypal', label: 'PayPal', icon: Shield, disabled: true },
                      { value: 'bank', label: 'Bank Transfer', icon: CreditCard, disabled: true }
                    ].map((method) => (
                      <label
                        key={method.value}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.paymentMethod === method.value
                            ? 'border-[#1a2b49] bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        } ${method.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={formData.paymentMethod === method.value}
                          onChange={handleInputChange}
                          disabled={method.disabled}
                          className="sr-only"
                        />
                        <method.icon className="w-5 h-5 mr-3 text-[#1a2b49]" />
                        <span className="font-medium">{method.label}</span>
                        {method.disabled && (
                          <span className="ml-2 text-xs text-gray-500">(Coming Soon)</span>
                        )}
                      </label>
                    ))}
                  </div>

                  {/* Stripe Payment Form */}
                  {formData.paymentMethod === 'stripe' && clientSecret && (
                    <Elements stripe={getStripe()} options={{ clientSecret }}>
                      <StripePaymentForm 
                        clientSecret={clientSecret}
                        onPaymentSuccess={handleStripePaymentSuccess}
                        onPaymentError={handleStripePaymentError}
                      />
                    </Elements>
                  )}

                  {formData.paymentMethod === 'stripe' && isLoading && (
                    <div className="p-8 bg-gray-100 rounded-lg text-center">
                      <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-[#1a2b49]" />
                      <p className="text-gray-600">Loading payment form...</p>
                    </div>
                  )}

                  {formData.paymentMethod === 'stripe' && !clientSecret && !isLoading && !isFormValid() && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                      <p className="text-yellow-800">
                        Please fill in all required fields to proceed with payment.
                      </p>
                    </div>
                  )}

                  {isSubmitting && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                      <Loader className="w-6 h-6 animate-spin mx-auto mb-2 text-[#1a2b49]" />
                      <p className="text-blue-700">Confirming your booking...</p>
                    </div>
                  )}
                </section>
              </form>
            </motion.div>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-8"
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Booking Summary</h2>
              </div>

              <div className="p-6">
                {/* Room Image */}
                <div className="mb-4">
                  <img
                    src={room.images && room.images.length > 0 
                      ? room.images[0].startsWith('http') 
                        ? room.images[0] 
                        : `http://localhost:5000${room.images[0].replace(/\\/g, '/')}`
                      : 'https://via.placeholder.com/400x250?text=No+Image'
                    }
                    alt={room.roomType}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>

                {/* Room Details */}
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{room.roomType}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{room.description}</p>

                {/* Stay Details */}
                <div className="space-y-3 border-t border-gray-200 pt-4">
                  {formData.checkIn && formData.checkOut && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-in</span>
                        <span className="font-medium">{new Date(formData.checkIn).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-out</span>
                        <span className="font-medium">{new Date(formData.checkOut).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nights</span>
                        <span className="font-medium">{nights}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests</span>
                    <span className="font-medium">{formData.guests}</span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">${room.price} × {nights} nights</span>
                    <span>${room.price * nights}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>${totalPrice}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBookingForm;