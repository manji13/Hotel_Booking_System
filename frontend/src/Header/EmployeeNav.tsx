import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, X, Home, Users, PlusSquare, CalendarRange } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 1. The Rounded "M" Logo Component ---
const LogoM = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="18" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M22 80V25L50 53L78 25V80" />
  </svg>
);

// --- 2. Logout Confirmation Modal ---
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
              transition: { type: "spring", damping: 12, stiffness: 150 } 
            }}
            exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.2 } }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative"
          >
            <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
            </button>

            <div className="p-8 flex flex-col items-center text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 mb-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-inner border-4 border-white ring-4 ring-blue-50"
              >
                 <LogoM className="w-12 h-12" />
              </motion.div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">Signing out?</h3>
              <p className="text-gray-500 mb-8">You are logging out of the Employee Portal.</p>
              
              <div className="flex gap-4 w-full">
                <button 
                  onClick={onClose}
                  className="flex-1 px-6 py-3 text-sm font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={onConfirm}
                  className="flex-1 px-6 py-3 text-sm font-bold text-white bg-red-500 shadow-lg shadow-red-500/30 rounded-xl hover:bg-red-600 transition-colors"
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

// --- 3. Main Employee Navbar Component ---
const EmployeeNavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // To highlight active link
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogoutConfirm = () => {
    setIsLogoutModalOpen(false);
    navigate('/'); // Redirect to Landing Page or Login
  };

  // Helper to check if link is active
  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <Link 
      to={to} 
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 
        ${isActive(to) 
          ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
        }`}
    >
      <Icon className="w-4 h-4" />
      <span className="uppercase tracking-wide text-xs font-bold">{label}</span>
    </Link>
  );

  return (
    <>
      <style>{`
        @keyframes color-shift {
          0%, 100% { color: #2563eb; }
          50% { color: #7c3aed; } /* Purple for Employee Portal */
        }
        .animate-logo-color {
          animation: color-shift 5s infinite ease-in-out;
        }
      `}</style>

      <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Left Side - Employee Navigation Links */}
            <div className="flex-1 flex items-center justify-start gap-2">
              <NavLink to="/employee-home" icon={Home} label="Home" />
              <NavLink to="/userdetails" icon={Users} label="User Details" />
              <NavLink to="/addbooking" icon={PlusSquare} label="Add Rooms" />
              <NavLink to="/employee-bookings" icon={CalendarRange} label="Bookings" />
              <NavLink to="/detailsrooms" icon={PlusSquare} label="Details Room" />
            </div>

            {/* Center Logo */}
            <div className="flex-shrink-0 flex justify-center px-4">
              <Link to="/employee-home" className="group relative flex flex-col items-center">
                <div className="animate-logo-color transition-transform duration-300 group-hover:scale-110">
                  <LogoM className="w-14 h-14 drop-shadow-sm" />
                </div>
                <span className="absolute -bottom-4 text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">Employee</span>
              </Link>
            </div>

            {/* Right Side - Actions */}
            <div className="flex-1 flex items-center justify-end gap-4">
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-sm font-bold text-gray-800">Staff Portal</span>
                <span className="text-xs text-gray-500">Logged in</span>
              </div>
              
              <Link to="/employee-profile" className="p-2.5 text-gray-500 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-all group relative">
                <User className="w-5 h-5" strokeWidth={2.5} />
                <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs font-bold py-1 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  My Profile
                </span>
              </Link>

              <button 
                onClick={() => setIsLogoutModalOpen(true)}
                className="p-2.5 text-gray-500 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-full transition-all group relative active:scale-95"
              >
                <LogOut className="w-5 h-5" strokeWidth={2.5} />
                <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs font-bold py-1 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Logout
                </span>
              </button>
            </div>

          </div>
        </div>
      </nav>

      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={handleLogoutConfirm} 
      />
    </>
  );
};

export default EmployeeNavBar;