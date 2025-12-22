import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Home, Users, PlusSquare, CalendarRange, Layers, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Logout Confirmation Modal ---
interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative border border-gray-100"
          >
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Employee Logout</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to exit the staff portal?</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-lg shadow-red-500/20 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Custom Nav Link Component ---
const NavLink = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
        isActive 
          ? 'text-blue-700 bg-blue-50/50' 
          : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'
      }`}
    >
      <Icon size={18} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
      <span className="hidden lg:inline">{label}</span> {/* Text hidden on medium screens for space */}
      
      {/* Bottom Border Animation for Active/Hover */}
      {isActive && (
        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 rounded-full opacity-50"></span>
      )}
    </Link>
  );
};

// --- Main Employee Navbar Component ---
const EmployeeNavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState('Dashboard');

  const handleLogoutConfirm = () => {
    setIsLogoutModalOpen(false);
    navigate('/'); 
  };

  // Logic to determine the Page Topic based on URL
  useEffect(() => {
    const path = location.pathname;
    switch(path) {
      case '/employee_home_page': setPageTitle('Dashboard'); break;
      case '/userdetails': setPageTitle('User Management'); break;
      case '/addbooking': setPageTitle('Add Room'); break;
      case '/employee-bookings': setPageTitle('Booking Management'); break;
      case '/detailsrooms': setPageTitle('Room Inventory'); break;
      case '/employee-profile': setPageTitle('My Profile'); break;
      default: setPageTitle('Staff Portal');
    }
  }, [location]);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* LEFT: Brand & Page Topic */}
            <div className="flex-shrink-0 flex items-center gap-4">
              <div 
                onClick={() => navigate('/employee_home_page')}
                className="cursor-pointer flex flex-col"
              >
                <span className="text-m font-serif font-bold text-gray-900 tracking-wider leading-none">
                  MANJITHA GUEST<span className="text-blue-600">.</span>
                </span>
              </div>
              
              {/* Vertical Divider */}
              <div className="h-8 w-px bg-gray-300 hidden md:block"></div>

              {/* CURRENT PAGE TOPIC (Dynamic) */}
              <div className="hidden md:flex flex-col justify-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Page</span>
                <span className="text-sm font-bold text-blue-900 leading-tight">{pageTitle}</span>
              </div>
            </div>

            {/* CENTER: Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <NavLink to="/employee_home_page" icon={Home} label="Home" />
              <NavLink to="/userdetails" icon={Users} label="Users" />
              <NavLink to="/addbooking" icon={PlusSquare} label="Add Room" />
              <NavLink to="/employee-bookings" icon={CalendarRange} label="Bookings" />
              <NavLink to="/detailsrooms" icon={Layers} label="Inventory" />
            </div>

            {/* RIGHT: User Actions */}
            <div className="flex items-center gap-3">
              
              {/* Profile Button */}
              <Link 
                to="/employee-profile" 
                className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-300 group relative cursor-pointer"
              >
                <User size={20} strokeWidth={2} />
                <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-50">
                  PROFILE
                </span>
              </Link>

              {/* Logout Button */}
              <button 
                onClick={() => setIsLogoutModalOpen(true)}
                className="p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-300 group relative cursor-pointer"
              >
                <LogOut size={20} strokeWidth={2} />
                <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-50">
                  LOGOUT
                </span>
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* IMPORTANT: 
         Because the Navbar is 'fixed', it floats over your content.
         Use this spacer div to push your page content down so the 'Topic' isn't hidden.
      */}
      <div className="h-20 w-full bg-transparent"></div>

      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={handleLogoutConfirm} 
      />
    </>
  );
};

export default EmployeeNavBar;