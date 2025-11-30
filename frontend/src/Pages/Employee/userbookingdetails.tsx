import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  CheckCircle, 
  Clock, 
  CreditCard,
  Trash2,
  ArrowLeft,
  Loader,
  AlertTriangle
} from 'lucide-react';
import { getBooking, deleteBooking } from '../../service/paymentservice.ts';

interface BookingDetails {
  _id: string;
  roomId: {
    roomType: string;
    images: string[];
    price: number;
    description: string;
  };
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
  };
  stayDetails: {
    checkIn: string;
    checkOut: string;
    guests: number;
    nights: number;
  };
  paymentInfo: {
    amount: number;
    status: string;
    paymentMethod: string;
  };
  bookingStatus: string;
  createdAt: string;
}

const UserBookingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        if (!id) return;
        const data = await getBooking(id);
        setBooking(data);
      } catch (err) {
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this booking record? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      if (booking?._id) {
        await deleteBooking(booking._id);
        alert('Booking deleted successfully');
        navigate('/booking'); // Redirect back to booking list or home
      }
    } catch (err) {
      alert('Failed to delete booking');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 animate-spin text-[#1a2b49] mx-auto mb-4" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Booking not found'}</p>
          <button 
            onClick={() => navigate('/booking')}
            className="bg-[#1a2b49] text-white px-6 py-2 rounded-lg hover:bg-[#2c4a7c] transition-colors"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      
      <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-500 hover:text-[#1a2b49] mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
            <p className="text-gray-500 mt-1">ID: {booking._id}</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
             <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center ${
                booking.bookingStatus === 'confirmed' ? 'bg-green-100 text-green-700' : 
                booking.bookingStatus === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
             }`}>
               {booking.bookingStatus === 'confirmed' ? <CheckCircle className="w-4 h-4 mr-2"/> : <Clock className="w-4 h-4 mr-2"/>}
               {booking.bookingStatus.toUpperCase()}
             </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Room & Customer Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Room Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                  Hotel Room Information
                </h2>
              </div>
              <div className="p-6">
                 <div className="flex flex-col sm:flex-row gap-6">
                    <img 
                      src={booking.roomId.images[0]?.startsWith('http') 
                        ? booking.roomId.images[0] 
                        : `http://localhost:5000${booking.roomId.images[0]?.replace(/\\/g, '/')}`} 
                      alt={booking.roomId.roomType} 
                      className="w-full sm:w-40 h-32 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-[#1a2b49] mb-2">{booking.roomId.roomType}</h3>
                      <p className="text-gray-600 text-sm mb-4">{booking.roomId.description}</p>
                      <div className="flex items-center text-gray-500 text-sm">
                        <span className="font-medium text-green-600">${booking.roomId.price}</span>
                        <span className="mx-1">/</span>
                        <span>night</span>
                      </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                  <User className="w-5 h-5 mr-2 text-[#1a2b49]" />
                  Guest Information
                </h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
                    <p className="text-gray-800 font-medium">{booking.customerInfo.firstName} {booking.customerInfo.lastName}</p>
                 </div>
                 <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
                    <p className="text-gray-800 font-medium flex items-center">
                      <Mail className="w-3 h-3 mr-2 text-gray-400"/>
                      {booking.customerInfo.email}
                    </p>
                 </div>
                 <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</label>
                    <p className="text-gray-800 font-medium flex items-center">
                      <Phone className="w-3 h-3 mr-2 text-gray-400"/>
                      {booking.customerInfo.phone}
                    </p>
                 </div>
                 <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Country</label>
                    <p className="text-gray-800 font-medium flex items-center">
                      <Globe className="w-3 h-3 mr-2 text-gray-400"/>
                      {booking.customerInfo.country}
                    </p>
                 </div>
              </div>
            </div>

          </div>

          {/* Right Column: Summary & Actions */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Stay Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
               <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                 <Calendar className="w-5 h-5 mr-2 text-[#1a2b49]" />
                 Stay Summary
               </h2>
               
               <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 text-sm">Check-in</span>
                    <span className="font-semibold text-gray-900">{new Date(booking.stayDetails.checkIn).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 text-sm">Check-out</span>
                    <span className="font-semibold text-gray-900">{new Date(booking.stayDetails.checkOut).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center px-2">
                     <span className="text-gray-500">Total Nights</span>
                     <span className="font-medium">{booking.stayDetails.nights}</span>
                  </div>
                  <div className="flex justify-between items-center px-2">
                     <span className="text-gray-500">Guests</span>
                     <span className="font-medium">{booking.stayDetails.guests}</span>
                  </div>
               </div>

               <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Total Amount Paid</span>
                    <span className="text-2xl font-bold text-[#1a2b49]">${booking.paymentInfo.amount}</span>
                  </div>
                  <div className="flex items-center justify-end text-sm text-green-600">
                     <CreditCard className="w-3 h-3 mr-1"/>
                     Paid via Stripe
                  </div>
               </div>
            </div>

            {/* Admin/Employee Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6">
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Admin Actions</h3>
               
               <button
                 onClick={handleDelete}
                 disabled={isDeleting}
                 className="w-full flex items-center justify-center bg-red-50 text-red-600 py-3 px-4 rounded-lg font-medium hover:bg-red-100 hover:text-red-700 transition-colors border border-red-200"
               >
                 {isDeleting ? (
                   <Loader className="w-4 h-4 animate-spin mr-2"/> 
                 ) : (
                   <Trash2 className="w-4 h-4 mr-2" />
                 )}
                 {isDeleting ? 'Deleting...' : 'Delete Booking Record'}
               </button>
               <p className="text-xs text-gray-400 mt-3 text-center">
                 Warning: This action cannot be undone.
               </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBookingDetails;