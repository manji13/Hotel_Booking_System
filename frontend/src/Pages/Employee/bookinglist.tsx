import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, User, CheckCircle, Clock, Eye, Search, Loader, Filter, XCircle, FileText
} from 'lucide-react';
import { getAllBookings } from '../../service/paymentservice.ts';
import EmployeeNavBar from "../../Header/EmployeeNav.tsx";
import { motion } from 'framer-motion';

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
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <EmployeeNavBar />
      
      <main className="p-6 sm:p-10 max-w-7xl mx-auto">
        
        {/* Page Entry Animation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="text-blue-600 w-6 h-6" />
                All Bookings
              </h1>
              <p className="text-sm text-gray-500 mt-1">Manage and view all customer reservation records.</p>
            </div>
            
            {/* Search Bar */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search name, email, room..." 
                className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-72 transition-all shadow-sm cursor-text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                <span className="text-sm text-gray-400">Loading records...</span>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Filter className="w-12 h-12 text-gray-200 mb-3" />
                <h3 className="text-sm font-bold text-gray-600">No bookings found</h3>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your search filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-200">
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Guest Info</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Room Type</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stay Dates</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredBookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-blue-50/30 transition-colors group">
                        
                        {/* Guest Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs mr-3 shadow-sm border border-blue-100">
                              {booking.customerInfo.firstName[0]}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 leading-tight">
                                {booking.customerInfo.firstName} {booking.customerInfo.lastName}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5 font-medium">{booking.customerInfo.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Room Info */}
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                            {booking.roomId?.roomType || 'Unknown Room'}
                          </span>
                        </td>

                        {/* Dates */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col text-xs font-medium text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar size={12} className="text-gray-400" />
                              <span>{new Date(booking.stayDetails.checkIn).toLocaleDateString()}</span>
                            </div>
                            <span className="pl-4 text-gray-400 text-[10px]">to</span>
                            <div className="flex items-center gap-1">
                              <Calendar size={12} className="text-gray-400" />
                              <span>{new Date(booking.stayDetails.checkOut).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border shadow-sm ${
                            booking.bookingStatus === 'confirmed' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : booking.bookingStatus === 'cancelled'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            {booking.bookingStatus === 'confirmed' && <CheckCircle className="w-3 h-3 mr-1.5"/>}
                            {booking.bookingStatus === 'cancelled' && <XCircle className="w-3 h-3 mr-1.5"/>}
                            {booking.bookingStatus === 'pending' && <Clock className="w-3 h-3 mr-1.5"/>}
                            {booking.bookingStatus}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-gray-900">${booking.paymentInfo.amount}</span>
                        </td>

                        {/* Actions Button */}
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => navigate(`/booking-details/${booking._id}`)}
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer border active:scale-95 ${
                              booking.bookingStatus === 'cancelled'
                                ? 'text-red-600 bg-white border-red-100 hover:bg-red-50'
                                : 'text-blue-600 bg-white border-blue-100 hover:bg-blue-50'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1.5" />
                            View Details
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default EmployeeBookingList;