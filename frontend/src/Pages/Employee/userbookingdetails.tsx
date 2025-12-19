import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Calendar, CheckCircle, Clock, Trash2, ArrowLeft, Loader, AlertTriangle 
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

  // --- 1. Fetch Data on Load ---
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

  // --- 2. Handle Deletion & Auto-Navigate ---
  const handleDelete = async () => {
    // A. Confirm with User
    const confirmed = window.confirm(
      'Are you sure you want to cancel this reservation? This action cannot be undone.'
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      if (booking?._id) {
        // B. Call API to delete
        await deleteBooking(booking._id);
        
        // C. Success Message
        alert('Booking cancelled successfully.');
        
        // D. AUTO NAVIGATE BACK (Previous Page)
        // Using -1 sends the user to the page they were on before this one.
        navigate(-1); 
      }
    } catch (err) {
      console.error(err);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Helper: Fix Image URLs ---
  const getImageUrl = (path: string) => {
      if (!path) return '';
      if (path.startsWith('http')) return path;
      return `http://localhost:5000${path.startsWith('/') ? path : '/' + path}`;
  };

  // --- Loading State ---
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader className="w-10 h-10 animate-spin text-blue-900" />
    </div>
  );

  // --- Error State ---
  if (error || !booking) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-xl shadow-sm">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-4 text-gray-800">Booking not found</h2>
        <p className="text-gray-500 mb-6">This booking may have been deleted or does not exist.</p>
        <button 
          onClick={() => navigate(-1)} 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Back Button - Also updated to go back to previous page */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-500 hover:text-blue-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
           <div>
             <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
             <p className="text-sm text-gray-500 mt-1">ID: {booking._id}</p>
           </div>
           <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center ${booking.bookingStatus === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {booking.bookingStatus === 'confirmed' ? <CheckCircle className="w-4 h-4 mr-2"/> : <Clock className="w-4 h-4 mr-2"/>}
              {booking.bookingStatus.toUpperCase()}
           </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Room Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-bold mb-4 text-gray-800">Room Information</h2>
              <div className="flex flex-col sm:flex-row gap-6">
                 {booking.roomId?.images && (
                   <img 
                     src={getImageUrl(booking.roomId.images[0])} 
                     alt="Room" 
                     className="w-full sm:w-40 h-32 object-cover rounded-lg bg-gray-100"
                   />
                 )}
                 <div>
                   <h3 className="text-xl font-semibold text-blue-900">{booking.roomId?.roomType || 'Room Unavailable'}</h3>
                   <p className="text-gray-600 mt-2 text-sm line-clamp-2">{booking.roomId?.description}</p>
                   <div className="mt-3 font-medium text-gray-900">
                     ${booking.roomId?.price} / night
                   </div>
                 </div>
              </div>
            </div>

            {/* Guest Details */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
               <h2 className="text-lg font-bold mb-4 flex items-center text-gray-800">
                 <User className="w-5 h-5 mr-2" /> Guest Details
               </h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                 <div className="p-3 bg-gray-50 rounded-lg">
                   <span className="block font-bold text-gray-400 text-xs uppercase mb-1">Name</span> 
                   <span className="text-gray-800">{booking.customerInfo.firstName} {booking.customerInfo.lastName}</span>
                 </div>
                 <div className="p-3 bg-gray-50 rounded-lg">
                   <span className="block font-bold text-gray-400 text-xs uppercase mb-1">Email</span> 
                   <span className="text-gray-800 break-all">{booking.customerInfo.email}</span>
                 </div>
                 <div className="p-3 bg-gray-50 rounded-lg">
                   <span className="block font-bold text-gray-400 text-xs uppercase mb-1">Phone</span> 
                   <span className="text-gray-800">{booking.customerInfo.phone}</span>
                 </div>
                 <div className="p-3 bg-gray-50 rounded-lg">
                   <span className="block font-bold text-gray-400 text-xs uppercase mb-1">Country</span> 
                   <span className="text-gray-800">{booking.customerInfo.country}</span>
                 </div>
               </div>
            </div>
          </div>

          {/* Sidebar Summary Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
               <h2 className="text-lg font-bold mb-4 flex items-center text-gray-800">
                 <Calendar className="w-5 h-5 mr-2" /> Summary
               </h2>
               <div className="space-y-4 text-sm">
                 <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                   <span className="text-gray-500">Check-in</span> 
                   <strong className="text-gray-800">{new Date(booking.stayDetails.checkIn).toLocaleDateString()}</strong>
                 </div>
                 <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                   <span className="text-gray-500">Check-out</span> 
                   <strong className="text-gray-800">{new Date(booking.stayDetails.checkOut).toLocaleDateString()}</strong>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-gray-500">Nights</span> 
                   <strong className="text-gray-800">{booking.stayDetails.nights}</strong>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-gray-500">Guests</span> 
                   <strong className="text-gray-800">{booking.stayDetails.guests}</strong>
                 </div>
                 
                 <div className="border-t border-dashed border-gray-200 pt-4 mt-2 flex justify-between text-lg font-bold text-blue-900">
                   <span>Total Paid</span>
                   <span>${booking.paymentInfo.amount}</span>
                 </div>
               </div>
            </div>

            {/* Cancel Button */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-red-100">
              <button 
                onClick={handleDelete} 
                disabled={isDeleting}
                className="w-full flex items-center justify-center bg-red-50 text-red-600 py-3 rounded-lg font-bold hover:bg-red-100 transition-colors border border-red-200"
              >
                {isDeleting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" /> Cancel Reservation
                  </>
                )}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">
                Cancelling will permanently delete this booking and refund the room stock.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserBookingDetails;