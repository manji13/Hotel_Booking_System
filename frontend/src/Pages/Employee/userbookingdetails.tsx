import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Calendar, CheckCircle, Clock, Trash2, ArrowLeft, Loader, AlertTriangle, X 
} from 'lucide-react';
import { getBooking, deleteBooking } from '../../service/paymentservice.ts';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Interface Definition (Same as before)
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
  
  // --- New State for Beautiful Modals ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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

  // --- 2. Handle Deletion ---
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      if (booking?._id) {
        await deleteBooking(booking._id);
        
        // Success Toast
        toast.success('Booking cancelled successfully', { icon: '🗑️' });
        
        // Close Modal & Navigate Back
        setIsDeleteModalOpen(false);
        setTimeout(() => navigate(-1), 1500); 
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to cancel booking. Please try again.');
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
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans text-gray-800">
      
      {/* Toast Notification Config */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#333', color: '#fff' },
          success: { style: { background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' } },
          error: { style: { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' } },
        }}
      />

      <div className="max-w-5xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-500 hover:text-blue-900 mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
           <div>
             <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
             <p className="text-sm text-gray-500 mt-1 font-mono">ID: {booking._id}</p>
           </div>
           <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center shadow-sm ${booking.bookingStatus === 'confirmed' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'}`}>
              {booking.bookingStatus === 'confirmed' ? <CheckCircle className="w-4 h-4 mr-2"/> : <Clock className="w-4 h-4 mr-2"/>}
              {booking.bookingStatus.toUpperCase()}
           </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Room Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Room Information</h2>
              <div className="flex flex-col sm:flex-row gap-6">
                  {booking.roomId?.images && (
                    <img 
                      src={getImageUrl(booking.roomId.images[0])} 
                      alt="Room" 
                      className="w-full sm:w-48 h-32 object-cover rounded-lg bg-gray-100 shadow-sm"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-blue-900">{booking.roomId?.roomType || 'Room Unavailable'}</h3>
                    <p className="text-gray-600 mt-2 text-sm line-clamp-2 leading-relaxed">{booking.roomId?.description}</p>
                    <div className="mt-3 font-semibold text-gray-900 bg-blue-50 inline-block px-3 py-1 rounded-md text-sm">
                      ${booking.roomId?.price} <span className="font-normal text-gray-500">/ night</span>
                    </div>
                  </div>
              </div>
            </div>

            {/* Guest Details */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
               <h2 className="text-lg font-bold mb-4 flex items-center text-gray-800 border-b pb-2">
                 <User className="w-5 h-5 mr-2 text-blue-600" /> Guest Details
               </h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                 <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                   <span className="block font-bold text-gray-400 text-xs uppercase mb-1">Name</span> 
                   <span className="text-gray-900 font-medium">{booking.customerInfo.firstName} {booking.customerInfo.lastName}</span>
                 </div>
                 <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                   <span className="block font-bold text-gray-400 text-xs uppercase mb-1">Email</span> 
                   <span className="text-gray-900 font-medium break-all">{booking.customerInfo.email}</span>
                 </div>
                 <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                   <span className="block font-bold text-gray-400 text-xs uppercase mb-1">Phone</span> 
                   <span className="text-gray-900 font-medium">{booking.customerInfo.phone}</span>
                 </div>
                 <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                   <span className="block font-bold text-gray-400 text-xs uppercase mb-1">Country</span> 
                   <span className="text-gray-900 font-medium">{booking.customerInfo.country}</span>
                 </div>
               </div>
            </div>
          </div>

          {/* Sidebar Summary Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-fit sticky top-6">
               <h2 className="text-lg font-bold mb-4 flex items-center text-gray-800 border-b pb-2">
                 <Calendar className="w-5 h-5 mr-2 text-blue-600" /> Summary
               </h2>
               <div className="space-y-4 text-sm">
                 <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                   <span className="text-gray-500 font-medium">Check-in</span> 
                   <strong className="text-gray-900">{new Date(booking.stayDetails.checkIn).toLocaleDateString()}</strong>
                 </div>
                 <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                   <span className="text-gray-500 font-medium">Check-out</span> 
                   <strong className="text-gray-900">{new Date(booking.stayDetails.checkOut).toLocaleDateString()}</strong>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-gray-500 font-medium">Nights</span> 
                   <strong className="text-gray-900">{booking.stayDetails.nights}</strong>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-gray-500 font-medium">Guests</span> 
                   <strong className="text-gray-900">{booking.stayDetails.guests}</strong>
                 </div>
                 
                 <div className="border-t-2 border-dashed border-gray-200 pt-4 mt-2 flex justify-between items-center">
                   <span className="text-gray-600 font-bold">Total Paid</span>
                   <span className="text-2xl font-bold text-blue-700">${booking.paymentInfo.amount}</span>
                 </div>
               </div>
            </div>

            {/* Cancel Button - Triggers Modal */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-red-100">
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-full flex items-center justify-center bg-red-50 text-red-600 py-3 rounded-lg font-bold hover:bg-red-600 hover:text-white transition-all border border-red-200 shadow-sm active:scale-95"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Cancel Reservation
              </button>
              <p className="text-xs text-gray-400 text-center mt-3 leading-relaxed">
                Cancelling will permanently delete this booking record.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* --- BEAUTIFUL DELETE CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsDeleteModalOpen(false)}
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-red-100"
            >
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={20} />
              </button>

              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-100 animate-pulse">
                  <AlertTriangle size={32} strokeWidth={2.5} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Reservation?</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  Are you sure you want to cancel this booking? This action <span className="font-bold text-red-500">cannot be undone</span>.
                </p>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Keep Booking
                  </button>
                  <button 
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isDeleting ? <Loader className="w-4 h-4 animate-spin"/> : <Trash2 size={18} />}
                    {isDeleting ? 'Cancelling...' : 'Yes, Cancel'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default UserBookingDetails;