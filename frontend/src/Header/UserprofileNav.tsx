import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Calendar, User, ArrowLeft, LogOut, ChevronDown } from 'lucide-react';

const UserProfileNavbar = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* LEFT: Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-all duration-300 group px-3 py-2 rounded-lg hover:bg-blue-50/50 cursor-pointer"
            >
              <div className="p-1.5 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-colors">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
              </div>
              <span className="text-sm uppercase tracking-wide">Back</span>
            </button>

            {/* CENTER: Brand Name */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <span className="text-m font-serif font-bold text-gray-900 tracking-wider cursor-default select-none">
                MANJITHA GUEST<span className="text-blue-600">.</span>
              </span>
            </div>

            {/* RIGHT: User Actions */}
            <div className="flex items-center space-x-3">
              
              {/* My Bookings Button (Hidden on very small screens) */}
              <Link
                to="/my-history"
                className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium px-4 py-2 rounded-full border border-transparent hover:border-blue-100 hover:bg-blue-50 transition-all duration-300 group cursor-pointer"
              >
                <Calendar size={18} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                <span className="text-sm">My Bookings</span>
              </Link>

              {/* Vertical Divider */}
              <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 cursor-pointer ${
                    showDropdown 
                      ? 'bg-blue-50 border-blue-200 text-blue-700' 
                      : 'bg-white border-gray-200 text-gray-700 hover:border-blue-200 hover:shadow-md'
                  }`}
                >
                  <div className={`p-1.5 rounded-full ${showDropdown ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    <User size={18} />
                  </div>
                  <span className="text-sm font-medium hidden sm:block">Account</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 top-14 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 py-2 z-50 transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Menu</p>
                    </div>

                    <Link
                      to="/userprofile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 mx-2 rounded-lg cursor-pointer"
                      onClick={() => setShowDropdown(false)}
                    >
                      <User size={16} />
                      <span>My Profile</span>
                    </Link>
                    
                    <Link
                      to="/my-history"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 mx-2 rounded-lg cursor-pointer"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Calendar size={16} />
                      <span>Booking History</span>
                    </Link>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 mx-2 rounded-lg mb-1 cursor-pointer"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Backdrop for dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40 bg-transparent cursor-default" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </>
  );
};

export default UserProfileNavbar;