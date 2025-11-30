import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, User, CheckCircle, Clock, Eye, Search, Loader, Filter
} from 'lucide-react';
import { getAllBookings } from '../../service/paymentservice.ts';
import EmployeeNavBar from "../../Header/EmployeeNav.tsx";

interface BookingSummary {
  _id: string;
  roomId: {
    roomType: string;
    price: number;
  };
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  stayDetails: {
    checkIn: string;
    checkOut: string;
  };
  bookingStatus: string;
  paymentInfo: {
    amount: number;
  };
}

const EmployeeBookingList = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getAllBookings();
        setBookings(data);
      } catch (error) {
        console.error("Error loading bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Filter bookings based on search
  const filteredBookings = bookings.filter(booking => 
    booking.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.customerInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.roomId?.roomType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeNavBar />
      
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>
            <p className="text-gray-500">Manage and view all customer reservations</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by name, email, or room..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
            <p className="text-gray-500">Try adjusting your search or wait for new reservations.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Guest</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Room</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3">
                            {booking.customerInfo.firstName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {booking.customerInfo.firstName} {booking.customerInfo.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{booking.customerInfo.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {booking.roomId?.roomType || 'Unknown Room'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex flex-col">
                          <span>{new Date(booking.stayDetails.checkIn).toLocaleDateString()}</span>
                          <span className="text-xs text-gray-400">to</span>
                          <span>{new Date(booking.stayDetails.checkOut).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.bookingStatus === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.bookingStatus === 'confirmed' ? <CheckCircle className="w-3 h-3 mr-1"/> : <Clock className="w-3 h-3 mr-1"/>}
                          {booking.bookingStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        ${booking.paymentInfo.amount}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => navigate(`/booking-details/${booking._id}`)}
                          className="text-blue-600 hover:text-blue-900 font-medium text-sm flex items-center hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeBookingList;