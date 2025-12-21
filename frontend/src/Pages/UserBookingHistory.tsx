import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Loader, LayoutGrid, Eye, Trash2, ArrowLeft, AlertTriangle, XCircle 
} from 'lucide-react';
import { getUserBookings, deleteBooking } from '../service/paymentservice';
import UserProfileNavbar from '../Header/UserprofileNav';

const UserBookingHistory = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Get logged-in user data from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchMyBookings = async () => {
    try {
      if (!user._id) {
        navigate('/login');
        return;
      }
      const data = await getUserBookings(user._id);
      setBookings(data);
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  // 1. Open Modal
  const initiateCancel = (id: string) => {
    setSelectedBookingId(id);
    setShowConfirmModal(true);
  };

  // 2. Perform Cancellation
  const confirmCancellation = async () => {
    if (!selectedBookingId) return;

    setIsCancelling(true);
    try {
      await deleteBooking(selectedBookingId);
      await fetchMyBookings(); // Refresh list
      setShowConfirmModal(false);
      setSelectedBookingId(null);
      // Optional: Add a success toast here if you have one
    } catch (error) {
      alert("Failed to cancel booking");
    } finally {
      setIsCancelling(false);
    }
  };

  // 3. Close Modal
  const closeModal = () => {
    setShowConfirmModal(false);
    setSelectedBookingId(null);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <Loader className="w-10 h-10 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <UserProfileNavbar />
      
      <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 pt-24">
        
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors md:hidden"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">My Booking History</h1>
        </div>
        
        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <LayoutGrid className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">
              You haven't made any reservations. Explore our rooms and book your stay today.
            </p>
            <button 
              onClick={() => navigate('/booking')} 
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Browse Rooms
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition-shadow">
                
                {/* Left Side: Info */}
                <div className="flex items-center gap-5 w-full">
                  <div className={`h-16 w-16 rounded-xl flex items-center justify-center shrink-0 ${
                    booking.bookingStatus === 'cancelled' ? 'bg-red-50 text-red-400' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {booking.bookingStatus === 'cancelled' ? <XCircle className="w-8 h-8" /> : <Calendar className="w-8 h-8" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                      {booking.roomId ? booking.roomId.roomType : <span className="text-red-500 italic">Room Removed</span>}
                    </h3>
                    <div className="text-sm text-gray-500 mt-1 space-y-1">
                      <p>
                        <span className="font-medium text-gray-700">Check-in:</span> {new Date(booking.stayDetails.checkIn).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">Total:</span> ${booking.paymentInfo.amount}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side: Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
                  <button 
                    onClick={() => navigate(`/booking-details/${booking._id}`)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm border border-gray-200"
                  >
                    <Eye className="w-4 h-4" /> Details
                  </button>

                  {/* CONDITIONAL RENDERING FOR CANCEL BUTTON */}
                  {booking.bookingStatus === 'cancelled' ? (
                    <div className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium text-sm border border-red-200 cursor-not-allowed opacity-80">
                      <XCircle className="w-4 h-4" /> Cancelled
                    </div>
                  ) : (
                    <button 
                      onClick={() => initiateCancel(booking._id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm border border-red-100"
                    >
                      <Trash2 className="w-4 h-4" /> Cancel
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- CONFIRMATION POPUP MODAL --- */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Booking?</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to cancel this booking? The room will be made available to others immediately.
              </p>
              
              <div className="flex gap-3 w-full">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={isCancelling}
                >
                  No, Keep it
                </button>
                <button
                  onClick={confirmCancellation}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex justify-center items-center"
                  disabled={isCancelling}
                >
                  {isCancelling ? <Loader className="w-5 h-5 animate-spin" /> : "Yes, Cancel Booking"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserBookingHistory;