import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Globe, Calendar, CheckCircle, Clock, Trash2, ArrowLeft, Loader, AlertTriangle
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
    // 1. Confirmation Prompt
    if (!window.confirm('Are you sure you want to delete this booking? This will make the room available for others.')) {
      return;
    }

    setIsDeleting(true);
    try {
      if (booking?._id) {
        // 2. Call Backend API
        // This triggers the Controller logic that deletes booking AND increases room stock
        await deleteBooking(booking._id);
        
        alert('Booking cancelled successfully. Room is now available.');
        
        // 3. Navigate back to the Room List / Booking Page
        // This forces the Booking page to re-fetch data, showing the updated stock availability
        navigate('/booking'); 
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete booking');
      setIsDeleting(false);
    }
  };

  // --- Helper for Image URLs ---
  const getImageUrl = (path: string) => {
      if (!path) return '';
      if (path.startsWith('http')) return path;
      return `http://localhost:5000${path.startsWith('/') ? path : '/' + path}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-10 h-10 animate-spin text-[#1a2b49]" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Booking not found'}</p>
          <button onClick={() => navigate('/booking')} className="bg-[#1a2b49] text-white px-6 py-2 rounded-lg hover:bg-[#2c4a7c] transition-colors">
            Back to Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-[#1a2b49] mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
            <p className="text-gray-500 mt-1">ID: {booking._id}</p>
          </div>
          <div className="mt-4 md:mt-0">
             <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center ${booking.bookingStatus === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
               {booking.bookingStatus === 'confirmed' ? <CheckCircle className="w-4 h-4 mr-2"/> : <Clock className="w-4 h-4 mr-2"/>}
               {booking.bookingStatus.toUpperCase()}
             </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Room & Guest Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Room Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">Hotel Room Information</h2>
              </div>
              <div className="p-6 flex flex-col sm:flex-row gap-6">
                 {booking.roomId && booking.roomId.images && (
                   <img 
                     src={getImageUrl(booking.roomId.images[0])} 
                     alt={booking.roomId.roomType} 
                     className="w-full sm:w-40 h-32 object-cover rounded-lg"
                   />
                 )}
                 <div>
                   <h3 className="text-xl font-semibold text-[#1a2b49] mb-2">
                     {booking.roomId ? booking.roomId.roomType : 'Room details unavailable'}
                   </h3>
                   <p className="text-gray-600 text-sm mb-4">
                     {booking.roomId ? booking.roomId.description : ''}
                   </p>
                   <div className="text-sm">
                     <span className="font-medium text-green-600">
                       ${booking.roomId ? booking.roomId.price : 0}
                     </span> / night
                   </div>
                 </div>
              </div>
            </div>

            {/* Guest Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-6 border-b border-gray-100">
                 <h2 className="text-lg font-bold text-gray-800 flex items-center">
                   <User className="w-5 h-5 mr-2" /> Guest Information
                 </h2>
               </div>
               <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div><label className="text-xs font-bold text-gray-400 uppercase">Name</label><p>{booking.customerInfo.firstName} {booking.customerInfo.lastName}</p></div>
                 <div><label className="text-xs font-bold text-gray-400 uppercase">Email</label><p>{booking.customerInfo.email}</p></div>
                 <div><label className="text-xs font-bold text-gray-400 uppercase">Phone</label><p>{booking.customerInfo.phone}</p></div>
                 <div><label className="text-xs font-bold text-gray-400 uppercase">Country</label><p>{booking.customerInfo.country}</p></div>
               </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Summary & Actions */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Stay Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
               <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center"><Calendar className="w-5 h-5 mr-2" /> Stay Summary</h2>
               <div className="space-y-4">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">Check-in</span>
                    <span className="font-bold">{new Date(booking.stayDetails.checkIn).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">Check-out</span>
                    <span className="font-bold">{new Date(booking.stayDetails.checkOut).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between px-2"><span className="text-gray-500">Nights</span><span>{booking.stayDetails.nights}</span></div>
                  <div className="flex justify-between px-2"><span className="text-gray-500">Guests</span><span>{booking.stayDetails.guests}</span></div>
               </div>
               <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between">
                 <span className="text-gray-600">Total Paid</span>
                 <span className="text-2xl font-bold text-[#1a2b49]">${booking.paymentInfo.amount}</span>
               </div>
            </div>

            {/* DELETE ACTION */}
            <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6">
               <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Cancel Reservation</h3>
               <button 
                 onClick={handleDelete} 
                 disabled={isDeleting} 
                 className="w-full flex items-center justify-center bg-red-50 text-red-600 py-3 px-4 rounded-lg font-bold hover:bg-red-100 transition-colors border border-red-200"
               >
                 {isDeleting ? <Loader className="w-4 h-4 animate-spin mr-2"/> : <Trash2 className="w-4 h-4 mr-2" />}
                 {isDeleting ? 'Processing...' : 'Delete & Refund Stock'}
               </button>
               <p className="text-xs text-gray-400 mt-3 text-center">
                 Deleting this booking will automatically increase the available room count by +1.
               </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserBookingDetails;