import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, User, LogIn, LogOut, Shield, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Hide Navbar on Login and Register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.reload();
  };

  // Logic to protect the Booking Route
  const handleBookingClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault(); // Stop navigation
      setShowAuthModal(true);
    }
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
      {/* Background: Professional Gradient */}
      <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-blue-50 via-white to-red-50 backdrop-blur-md border-b border-white/50 shadow-sm z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20"> 
            
            {/* LEFT SIDE: Booking Button & Links */}
            <div className="flex items-center space-x-8">
              <Link 
                to="/booking" 
                onClick={handleBookingClick}
                className="group relative flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-full text-sm font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              >
                {/* Button Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                <CalendarDays size={18} className="relative z-10" />
                <span className="relative z-10">Book Now</span>
              </Link>
              
              <div className="hidden md:flex space-x-6 text-sm font-medium text-gray-600">
                  <Link to="/" className="hover:text-blue-600 transition-colors relative group">
                    Home
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
              </div>
            </div>

            {/* CENTER: The "M" Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Link to="/" className="group relative flex items-center justify-center h-12 w-12 bg-white border border-blue-100 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">
                {/* Logo Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="h-7 w-7 text-blue-600 group-hover:text-blue-700 relative z-10"
                >
                  <path d="M21 21V3l-9 9-9-9v18" />
                </svg>
              </Link>
            </div>

            {/* RIGHT SIDE: Auth Buttons */}
            <div className="flex items-center space-x-4">
              {user ? (
                // Logged In View
                <div className="flex items-center gap-4 pl-6 border-l border-gray-200/50">
                  <div className="flex flex-col items-end mr-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Welcome</span>
                    <span className="text-sm font-bold text-gray-800 leading-none">
                      {user.name.split(' ')[0]}
                    </span>
                  </div>
                  
                  <div className="relative h-10 w-10 bg-gradient-to-tr from-blue-100 to-blue-50 rounded-full flex items-center justify-center text-blue-600 shadow-inner border border-white group">
                    <User size={20} />
                    {/* Online Indicator */}
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>

                  <button 
                    onClick={handleLogout}
                    className="group p-2 rounded-full hover:bg-red-50 transition-all duration-300 text-gray-400 hover:text-red-500 hover:scale-110"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                // Logged Out View
                <>
                  <Link 
                    to="/login" 
                    className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium text-sm transition-all duration-300 px-4 py-2 rounded-lg hover:bg-blue-50/50 hover:scale-105"
                  >
                    <LogIn size={18} />
                    <span>Login</span>
                  </Link>
                  <Link 
                    to="/register" 
                    className="group relative px-6 py-2.5 text-sm font-bold text-blue-600 border-2 border-blue-200 rounded-full hover:border-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden"
                  >
                    {/* Button Background Effect */}
                    <div className="absolute inset-0 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    <span className="relative z-10">Register</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Beautiful Centered Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-500"
            onClick={closeModal}
          />
          
          {/* Modal Content */}
          <div 
            className={`relative transform transition-all duration-500 ease-out ${
              showAuthModal ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
          >
            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-xl opacity-20 animate-pulse" />
            
            {/* Main Card */}
            <div className="relative bg-white/95 p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center space-y-6 max-w-md w-full mx-4 border border-white/20">
              
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-all duration-300 text-gray-400 hover:text-gray-600 hover:scale-110"
              >
                <X size={20} />
              </button>
              
              {/* Animated Icon Container */}
              <div className="relative">
                {/* Outer Ring Animation */}
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75" />
                {/* Middle Ring */}
                <div className="absolute inset-0 bg-blue-200 rounded-full animate-pulse opacity-50" />
                {/* Icon Background */}
                <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-full shadow-lg transform transition-transform duration-300 hover:scale-110">
                  <Shield size={32} className="text-white" />
                </div>
              </div>

              {/* Text Content with Animation */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
                  Authentication Required
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Please <span className="font-semibold text-blue-600">register</span> or <span className="font-semibold text-blue-600">login</span> to continue with your booking
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
                <button
                  onClick={() => handleAuthAction('/register')}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 transform hover:scale-105"
                >
                  Register Now
                </button>
                <button
                  onClick={() => handleAuthAction('/login')}
                  className="flex-1 border-2 border-blue-200 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:border-blue-600 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105"
                >
                  Login
                </button>
              </div>

              {/* Continue without account */}
              <button
                onClick={closeModal}
                className="text-sm text-gray-500 hover:text-gray-700 transition-all duration-300 transform hover:scale-105 underline"
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