import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, X, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Logout Modal Component ---
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
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
              <h3 className="text-lg font-bold text-gray-900 mb-2">Sign Out</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to end your session?</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-lg shadow-red-500/20 transition-all hover:-translate-y-0.5"
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
const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      className={`relative group px-1 py-2 text-sm font-medium tracking-wide transition-colors ${
        isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
      }`}
    >
      {children}
      <span className={`absolute bottom-0 left-0 h-0.5 bg-blue-600 transition-all duration-300 ease-out ${
        isActive ? 'w-full' : 'w-0 group-hover:w-full'
      }`} />
    </Link>
  );
};

// --- Main Navbar Component ---
const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogoutConfirm = () => {
    setIsLogoutModalOpen(false);
    navigate('/');
  };

  return (
    <>
      <nav className="fixed top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* BRAND NAME (Left) */}
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/Userpage')}>
              <span className="text-m font-serif font-bold text-gray-900 tracking-wider">
                MANJITHA GUEST<span className="text-blue-600">.</span>
              </span>
            </div>

            {/* CENTER LINKS (Hidden on Mobile) */}
            <div className="hidden md:flex items-center justify-center space-x-8">
              <NavLink to="/Userpage">HOME</NavLink>
              <NavLink to="/about">ABOUT</NavLink>
              <NavLink to="/contact">CONTACT</NavLink>
            </div>

            {/* RIGHT SIDE ACTIONS */}
            <div className="flex items-center gap-3">
              
              {/* Booking Button - Animated Gradient */}
              <Link 
                to="/booking" 
                className="hidden md:block relative px-6 py-2.5 rounded-full bg-gray-900 text-white text-xs font-bold uppercase tracking-widest overflow-hidden group hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-0.5"
              >
                <span className="relative z-10 group-hover:text-white transition-colors">Book Now</span>
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>

              <div className="w-px h-6 bg-gray-200 hidden md:block mx-1"></div>

              {/* Profile Icon */}
              <Link 
                to="/userprofile" 
                className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-300 group relative"
              >
                <User size={20} strokeWidth={2} />
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  PROFILE
                </span>
              </Link>

              {/* Logout Icon */}
              <button 
                onClick={() => setIsLogoutModalOpen(true)}
                className="p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-300 group relative"
              >
                <LogOut size={20} strokeWidth={2} />
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  LOGOUT
                </span>
              </button>

              {/* Mobile Menu Button */}
              <button 
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden bg-white border-t border-gray-100"
            >
              <div className="px-4 py-4 space-y-2 flex flex-col">
                <Link to="/Userpage" className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg">HOME</Link>
                <Link to="/about" className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg">ABOUT</Link>
                <Link to="/contact" className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg">CONTACT</Link>
                <Link to="/booking" className="block px-4 py-3 text-sm font-bold text-center text-white bg-blue-600 rounded-lg shadow-md mt-4">BOOK A ROOM</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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