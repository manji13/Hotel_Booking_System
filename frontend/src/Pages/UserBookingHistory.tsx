import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Loader, LayoutGrid, Eye, Trash2, ArrowLeft 
} from 'lucide-react';
import { getUserBookings, deleteBooking } from '../service/paymentservice';
import UserProfileNavbar from '../Header/UserprofileNav';

const UserBookingHistory = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleCancel = async (id: string) => {
    if (window.confirm("Are you sure you want to cancel this booking? The room will be made available to others.")) {
      try {
        await deleteBooking(id);
        // Refresh the list after deletion
        fetchMyBookings();
        alert("Booking cancelled successfully.");
      } catch (error) {
        alert("Failed to cancel booking");
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <Loader className="w-10 h-10 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <UserProfileNavbar />
      
      {/* ADDED 'pt-24' HERE TO FIX THE HIDDEN TEXT ISSUE */}
      <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 pt-24">
        
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors md:hidden"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">My Booking History</h1>
        </div>
        
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
                  <div className="h-16 w-16 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
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
                  <button 
                    onClick={() => handleCancel(booking._id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm border border-red-100"
                  >
                    <Trash2 className="w-4 h-4" /> Cancel
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBookingHistory;