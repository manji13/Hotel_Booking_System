import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, LogIn, Shield, X } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Hide Navbar on Login and Register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  // Logic to protect the Booking Route
  const handleBookingClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Stop navigation
    setShowAuthModal(true);
  };

  const closeModal = () => {
    setShowAuthModal(false);
  };

  const handleAuthAction = (path: string) => {
    setShowAuthModal(false);
    navigate(path);
  };

  return (
    <>
      {/* Background: Professional Glassmorphism & Blur */}
      <nav className="fixed top-0 left-0 w-full bg-white/70 backdrop-blur-xl border-b border-gray-100 shadow-sm z-40 transition-all duration-300 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20"> 
            
            {/* LEFT SIDE: Brand & Navigation */}
            <div className="flex items-center space-x-8">
               {/* Brand Name Text (Replcement for Logo) */}
               <Link to="/" className="text-m font-bold text-gray-800 tracking-tight hover:text-blue-600 transition-colors duration-300 font-serif">
                  MANJITHA GUEST.
               </Link>

              <div className="hidden md:flex space-x-6 text-sm font-medium text-gray-600">
                  <Link to="/" className="hover:text-blue-600 transition-colors relative group py-2">
                    Home
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                  {/* You can add more links here like About, Contact etc. */}
              </div>
            </div>

            {/* RIGHT SIDE: Action Buttons */}
            <div className="flex items-center space-x-4">
               {/* Book Now Button */}
              <Link 
                to="/booking" 
                onClick={handleBookingClick}
                className="group relative flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden cursor-pointer"
              >
                {/* Button Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                
                <CalendarDays size={16} className="relative z-10" />
                <span className="relative z-10">Book Now</span>
              </Link>

              {/* Divider */}
              <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

              {/* Login Link */}
              <Link 
                to="/login" 
                className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium text-sm transition-all duration-300 px-3 py-2 rounded-lg hover:bg-blue-50/50 cursor-pointer"
              >
                <LogIn size={16} />
                <span>Login</span>
              </Link>

              {/* Register Button */}
              <Link 
                to="/register" 
                className="group relative px-5 py-2.5 text-sm font-bold text-blue-600 border border-blue-200 rounded-full hover:border-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden cursor-pointer"
              >
                {/* Button Background Fill Animation */}
                <div className="absolute inset-0 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ease-out"></div>
                <span className="relative z-10">Register</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Beautiful Centered Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with strong blur */}
          <div 
            className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeModal}
          />
          
          {/* Modal Content */}
          <div 
            className={`relative w-full max-w-md transform transition-all duration-300 ease-out ${
              showAuthModal ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
            }`}
          >
            {/* Main Card with Glass Effect */}
            <div className="relative bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/50 flex flex-col items-center text-center space-y-6">
              
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 transition-all duration-200 cursor-pointer"
              >
                <X size={20} />
              </button>
              
              {/* Icon Container */}
              <div className="relative">
                <div className="absolute inset-0 bg-blue-50 rounded-full animate-ping opacity-75" />
                <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-full shadow-lg">
                  <Shield size={32} className="text-white" />
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-800">
                  Authentication Required
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">
                  Please <span className="font-semibold text-blue-600">register</span> or <span className="font-semibold text-blue-600">login</span> to secure your booking.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
                <button
                  onClick={() => handleAuthAction('/register')}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  Register Now
                </button>
                <button
                  onClick={() => handleAuthAction('/login')}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-semibold text-sm hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer"
                >
                  Login
                </button>
              </div>

              {/* Continue without account */}
              <button
                onClick={closeModal}
                className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors duration-200 underline decoration-gray-300 underline-offset-2 cursor-pointer"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;