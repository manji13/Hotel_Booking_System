import { useState, useEffect, useCallback } from 'react';
import { BedDouble, Users, Calendar, Search, ChevronLeft, ChevronRight, AlertCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import UserNavbar from "../Header/UserNav.jsx";
import { checkAvailability } from '../service/paymentservice'; 

interface Room {
  _id: string;
  roomType: string;
  images: string[];
  beds: number;
  capacity: number;
  price: number;
  description: string;
  availableCount: number;
}

// Helper to construct image URL
const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const cleanPath = imagePath.replace(/\\/g, '/');
  const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  return `http://localhost:5000${finalPath}`;
};

// --- Room Card Component ---
const RoomCard = ({ 
    room, 
    index, 
    checkIn, 
    checkOut, 
    onBookAttempt 
}: { 
    room: Room; 
    index: number; 
    checkIn: string; 
    checkOut: string;
    onBookAttempt: () => void; 
}) => {
  const navigate = useNavigate();
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [direction, setDirection] = useState(0);

  const hasMultipleImages = room.images && room.images.length > 1;
  const isSoldOut = room.availableCount < 1;

  // --- Image Change Logic ---
  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrentImgIdx((prev) => {
      let nextIndex = prev + newDirection;
      if (nextIndex < 0) nextIndex = room.images.length - 1;
      if (nextIndex >= room.images.length) nextIndex = 0;
      return nextIndex;
    });
  }, [room.images.length]);

  // --- Auto Change Images (Resets timer on manual click) ---
  useEffect(() => {
    if (!hasMultipleImages) return;
    
    const timer = setInterval(() => {
        paginate(1);
    }, 5000); 

    return () => clearInterval(timer);
  }, [hasMultipleImages, paginate, currentImgIdx]);

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 100 : -100, opacity: 0 }),
  };

  const handleBookClick = () => {
    if (!checkIn || !checkOut) {
        onBookAttempt(); 
        return;
    }

    if (!isSoldOut) {
        navigate(`/booking/${room._id}`, { state: { room, checkIn, checkOut } });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`flex flex-col md:flex-row gap-6 items-center bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
    >
      {/* Left Side: Image Carousel */}
      <div 
        className={`group w-full md:w-5/12 h-[220px] md:h-[260px] overflow-hidden relative rounded-lg bg-gray-100 ${!isSoldOut ? 'cursor-pointer' : 'cursor-not-allowed grayscale'}`}
        onClick={handleBookClick} 
      >
        <AnimatePresence initial={false} custom={direction}>
          {room.images && room.images.length > 0 ? (
            <motion.img
              key={currentImgIdx}
              src={getImageUrl(room.images[currentImgIdx])}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              alt={room.roomType}
              className="absolute w-full h-full object-cover"
              onError={(e) => (e.target as HTMLImageElement).src = "https://via.placeholder.com/600x400?text=No+Image"}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
          )}
        </AnimatePresence>

        {/* Sold Out Overlay */}
        {isSoldOut && (
            <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center">
                <span className="bg-red-600 text-white px-4 py-2 font-bold uppercase tracking-widest text-sm rounded shadow-lg">
                    {checkIn && checkOut ? 'Booked for Dates' : 'Sold Out'}
                </span>
            </div>
        )}

        {/* Navigation Arrows */}
        {hasMultipleImages && !isSoldOut && (
          <>
            <button 
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all z-10 text-gray-800 hover:scale-110" 
                onClick={(e) => { e.stopPropagation(); paginate(-1); }} 
            >
                <ChevronLeft size={20} />
            </button>
            <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all z-10 text-gray-800 hover:scale-110" 
                onClick={(e) => { e.stopPropagation(); paginate(1); }} 
            >
                <ChevronRight size={20} />
            </button>
            
            {/* Dots Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {room.images.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`w-2 h-2 rounded-full transition-all duration-300 shadow-sm ${idx === currentImgIdx ? 'bg-white scale-110' : 'bg-white/50'}`} 
                    />
                ))}
            </div>
          </>
        )}
      </div>

      {/* Right Side: Content */}
      <div className="w-full md:w-7/12 flex flex-col justify-center text-left space-y-3 px-2">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-medium tracking-wide text-gray-800">{room.roomType}</h2>
            <div className="mt-1">
                {isSoldOut ? (
                    <span className="text-red-500 text-xs font-bold flex items-center gap-1">
                        <AlertCircle size={12} /> Unavailable
                    </span>
                ) : (
                    <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full">
                        {room.availableCount} Available
                    </span>
                )}
            </div>
          </div>
          <span className="text-sm font-semibold text-[#1a2b49] bg-blue-50 px-3 py-1 rounded-full">${room.price} <span className="text-xs font-normal text-gray-500">/ night</span></span>
        </div>

        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{room.description || "Experience luxury and comfort."}</p>

        <div className="flex items-center gap-6 py-3 border-t border-gray-100 mt-2">
          <div className="flex items-center gap-2 text-gray-600"><BedDouble size={18} className="text-[#1a2b49]" /><span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{room.beds} Beds</span></div>
          <div className="flex items-center gap-2 text-gray-600"><Users size={18} className="text-[#1a2b49]" /><span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Max {room.capacity}</span></div>
        </div>

        <div className="pt-1">
          <button 
            onClick={handleBookClick} 
            disabled={isSoldOut} 
            className={`w-full md:w-auto px-6 py-2.5 text-[11px] font-bold tracking-[0.15em] uppercase transition-colors rounded shadow-sm ${isSoldOut ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#1a2b49] text-white hover:bg-[#2c4a7c]'}`}
          >
            {isSoldOut ? 'Unavailable' : 'View Details'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN BOOKING PAGE ---
const Booking = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  const today = new Date().toISOString().split('T')[0];
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  
  // Validation States
  const [dateError, setDateError] = useState(false); 
  const [showToast, setShowToast] = useState(false); 
  const [errorMessage, setErrorMessage] = useState(''); // Dynamic error message

  // Fetch rooms function
  const fetchRoomAvailability = async () => {
    setLoading(true);
    try {
      const data = await checkAvailability(checkIn, checkOut);
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial Fetch on Mount (fetches all rooms)
  useEffect(() => {
    fetchRoomAvailability();
  }, []);

  // --- NEW: Auto-Fetch when BOTH dates are selected AND VALID ---
  useEffect(() => {
    if (checkIn && checkOut) {
        const start = new Date(checkIn);
        const end = new Date(checkOut);

        if (end <= start) {
            // If date is invalid, don't auto-fetch, and show local error
            setDateError(true);
            setErrorMessage('Check-out must be after Check-in');
        } else {
            // Valid dates: Clear errors and Fetch
            setDateError(false);
            setErrorMessage('');
            fetchRoomAvailability();
            // Note: We do NOT clear setCheckIn or setCheckOut here, so they stay filled.
        }
    }
  }, [checkIn, checkOut]);

  // --- Logic to Handle Error Animation ---
  const triggerErrorAnimation = (msg: string) => {
    setDateError(true);
    setErrorMessage(msg);
    setShowToast(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setShowToast(false), 3000);
  };

  // --- Manual Search Button Handler ---
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Check existence
    if(!checkIn || !checkOut) {
        triggerErrorAnimation('Please select Check-in and Check-out dates first!');
        return;
    }

    // 2. Check Validity (Check-out > Check-in)
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (end <= start) {
        triggerErrorAnimation('Check-out date must be after Check-in date!');
        return;
    }

    // 3. Valid
    setDateError(false);
    setShowToast(false);
    fetchRoomAvailability();
  };

  // --- View Details Click Handler ---
  const handleBookAttempt = () => {
    // If we are here, it means checkIn or checkOut is missing (based on RoomCard logic)
    triggerErrorAnimation('Please select Check-in and Check-out dates first!');
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 z-50 fixed inset-0">
        <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="min-h-screen bg-gray-50 relative">
      <UserNavbar />
      
      {/* --- ANIMATED ERROR TOAST NOTIFICATION --- */}
      <AnimatePresence>
        {showToast && (
            <motion.div 
                initial={{ opacity: 0, y: -100, x: "-50%" }}
                animate={{ opacity: 1, y: 20 }}
                exit={{ opacity: 0, y: -100 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="fixed top-0 left-1/2 z-[100] flex items-center gap-3 bg-red-600 text-white px-8 py-4 rounded-full shadow-2xl backdrop-blur-md"
            >
                <XCircle className="w-6 h-6 text-red-200" />
                <span className="font-semibold tracking-wide">{errorMessage}</span>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Search Bar */}
          <motion.div 
            animate={dateError ? { x: [-10, 10, -10, 10, 0] } : {}} 
            transition={{ duration: 0.4 }}
            className={`bg-white p-6 rounded-xl shadow-md border-2 transition-all duration-300 ${dateError ? 'border-red-500 shadow-red-100' : 'border-gray-100'}`}
          >
             <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className={`text-sm font-semibold mb-1 flex items-center gap-2 ${dateError ? 'text-red-600' : 'text-gray-700'}`}>
                        <Calendar size={16}/> Check In
                    </label>
                    <input 
                        type="date" 
                        min={today}
                        value={checkIn}
                        onChange={(e) => {
                            setCheckIn(e.target.value);
                            // If user selects a new check-in that is after current check-out, we can optionally clear check-out
                            // But here we just let the validation catch it visually
                        }}
                        className={`w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 outline-none transition-all ${dateError ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'focus:ring-[#1a2b49]'}`}
                    />
                </div>
                <div className="flex-1 w-full">
                    <label className={`text-sm font-semibold mb-1 flex items-center gap-2 ${dateError ? 'text-red-600' : 'text-gray-700'}`}>
                        <Calendar size={16}/> Check Out
                    </label>
                    <input 
                        type="date" 
                        min={checkIn || today} // Ensure HTML prevents picking date before check-in
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className={`w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 outline-none transition-all ${dateError ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'focus:ring-[#1a2b49]'}`}
                    />
                </div>
                <button type="submit" className="w-full md:w-auto px-6 py-3 bg-[#1a2b49] text-white font-bold rounded-lg hover:bg-[#2c436b] transition-colors flex items-center justify-center gap-2">
                    <Search size={18}/> Check Availability
                </button>
             </form>
             {dateError && (
                <motion.p 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                    className="text-red-500 text-xs mt-2 font-bold flex items-center gap-1"
                >
                    <AlertCircle size={12}/> {errorMessage || 'Dates are required'}
                </motion.p>
             )}
          </motion.div>

          <div className="space-y-6">
            {rooms.length === 0 ? (
              <div className="text-center text-gray-500 py-10">No rooms found. Try adjusting dates.</div>
            ) : (
              rooms.map((room, index) => (
                <RoomCard 
                    key={room._id} 
                    room={room} 
                    index={index} 
                    checkIn={checkIn} 
                    checkOut={checkOut} 
                    onBookAttempt={handleBookAttempt}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Booking;