import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 1. The New "Rounded M" Logo Component (Matches your image) ---
// I replaced the architectural logo with this soft, rounded version
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
    {/* This path creates the thick, rounded "M" shape */}
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
              
              {/* --- SPINNING LOGO ANIMATION --- */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 mb-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-inner border-4 border-white ring-4 ring-blue-50"
              >
                 {/* This now uses the new rounded M */}
                 <LogoM className="w-12 h-12" />
              </motion.div>
              {/* ------------------------------- */}

              <h3 className="text-xl font-bold text-gray-900 mb-2">Signing out?</h3>
              <p className="text-gray-500 mb-8">We'll miss you! Click confirm to return to the home page.</p>
              
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
                  Yes, Logout
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- 3. Main Navbar Component ---
const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogoutConfirm = () => {
    setIsLogoutModalOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* Animation Styles */}
      <style>{`
        @keyframes color-shift {
          0%, 100% { color: #2563eb; } /* Blue */
          50% { color: #059669; }     /* Emerald Green */
        }
        .animate-logo-color {
          animation: color-shift 5s infinite ease-in-out;
        }
      `}</style>

      <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Left Side */}
            <div className="flex-1 flex items-center justify-start gap-6">
              <Link to="/" className="hidden md:block text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm uppercase tracking-wider">
                Home
              </Link>
              <Link to="/about" className="hidden md:block text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm uppercase tracking-wider">
                About Us
              </Link>
              <Link to="/booking" className="px-5 py-2.5 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all active:scale-95">
                Booking Now
              </Link>
            </div>

            {/* Center Logo */}
            <div className="flex-shrink-0 flex justify-center px-4">
              <Link to="/" className="group relative flex flex-col items-center">
                {/* The Logo Center Piece */}
                <div className="animate-logo-color transition-transform duration-300 group-hover:scale-110">
                  {/* This uses the new rounded M */}
                  <LogoM className="w-14 h-14 drop-shadow-sm" />
                </div>
              </Link>
            </div>

            {/* Right Side */}
            <div className="flex-1 flex items-center justify-end gap-4">
              <Link to="/contact" className="hidden md:block text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm uppercase tracking-wider mr-2">
                Contact Us
              </Link>
              
              <Link to="/profile" className="p-2.5 text-gray-500 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-all group relative">
                <User className="w-5 h-5" strokeWidth={2.5} />
                <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs font-bold py-1 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Profile
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

export default Navbar;