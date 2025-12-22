import { useState, useEffect, useCallback } from 'react';
import { BedDouble, Users, Calendar, Search, ChevronLeft, ChevronRight, AlertCircle, XCircle, MapPin, Star, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import UserNavbar from "../Header/UserNav.jsx";
import { checkAvailability } from '../service/paymentservice'; 

import Footer from '../Footer/Footer.tsx';

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

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrentImgIdx((prev) => {
      let nextIndex = prev + newDirection;
      if (nextIndex < 0) nextIndex = room.images.length - 1;
      if (nextIndex >= room.images.length) nextIndex = 0;
      return nextIndex;
    });
  }, [room.images.length]);

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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      // LAYOUT: Increased height and width, but removed clunky borders
      className={`group relative flex flex-col lg:flex-row h-auto lg:h-[380px] bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 ${isSoldOut ? 'opacity-90 grayscale-[0.3]' : ''}`}
    >
      {/* --- Visual Tracker 1: Large Image Area (55% width) --- */}
      <div 
        className="relative w-full lg:w-[55%] h-[280px] lg:h-full overflow-hidden bg-gray-200 cursor-pointer"
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
              className="absolute w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
               <span className="flex flex-col items-center gap-2"><MapPin className="opacity-50"/> No Image Available</span>
            </div>
          )}
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>
        
        {/* Status Badge - Sleek */}
        <div className="absolute top-4 left-4 z-20">
            {isSoldOut ? (
                <span className="bg-red-600 text-white px-3 py-1 font-semibold uppercase text-[11px] tracking-wider rounded-md shadow-lg flex items-center gap-2">
                    <XCircle size={14}/> Sold Out
                </span>
            ) : (
                <span className="bg-emerald-600 text-white px-3 py-1 font-semibold uppercase text-[11px] tracking-wider rounded-md shadow-lg flex items-center gap-2">
                    <CheckCircle2 size={14}/> {room.availableCount} Available
                </span>
            )}
        </div>

        {/* Navigation - Minimalist */}
        {hasMultipleImages && !isSoldOut && (
          <>
            <button 
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 p-2 rounded-full text-white transition-all z-20 opacity-0 group-hover:opacity-100" 
                onClick={(e) => { e.stopPropagation(); paginate(-1); }} 
            >
                <ChevronLeft size={20} />
            </button>
            <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 p-2 rounded-full text-white transition-all z-20 opacity-0 group-hover:opacity-100" 
                onClick={(e) => { e.stopPropagation(); paginate(1); }} 
            >
                <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* --- Visual Tracker 2: Info (Right Side) --- */}
      <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between relative">
        
        <div>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <div className="flex items-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
                        ))}
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold ml-1">Luxury Collection</span>
                    </div>
                    {/* TITLE: Large but elegant */}
                    <h2 className="text-3xl font-serif text-gray-900 group-hover:text-blue-800 transition-colors">
                        {room.roomType}
                    </h2>
                </div>
                <div className="text-right">
                    <span className="block text-3xl font-bold text-blue-900">${room.price}</span>
                    <span className="text-xs text-gray-500 font-medium">/ night</span>
                </div>
            </div>

            <div className="w-12 h-1 bg-blue-100 mb-4"></div>

            <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                {room.description || "Experience refined luxury with our carefully curated room amenities and breathtaking views."}
            </p>

            {/* Amenities - Clean Look */}
            <div className="flex gap-6 mb-6">
                <div className="flex items-center gap-2 text-gray-700">
                    <BedDouble size={20} className="text-blue-900" />
                    <span className="text-sm font-medium">{room.beds} Beds</span>
                </div>
                <div className="h-6 w-px bg-gray-200"></div>
                <div className="flex items-center gap-2 text-gray-700">
                    <Users size={20} className="text-blue-900" />
                    <span className="text-sm font-medium">Max {room.capacity} Guests</span>
                </div>
            </div>
        </div>

        {/* Bottom: Button (Standard Size, not Jumbo) */}
        <div className="mt-auto pt-4 border-t border-gray-100">
            <button 
                onClick={handleBookClick} 
                disabled={isSoldOut} 
                className={`w-full py-3 px-6 rounded-lg font-semibold text-sm tracking-wide uppercase flex items-center justify-between transition-all duration-300 ${
                    isSoldOut 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#1a2b49] text-white hover:bg-blue-800 shadow-md hover:shadow-lg'
                }`}
            >
                {isSoldOut ? (
                    'Sold Out'
                ) : (
                    <>
                        <span>View Details & Book</span>
                        <ArrowRight size={18} />
                    </>
                )}
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
  
  const [dateError, setDateError] = useState(false); 
  const [showToast, setShowToast] = useState(false); 
  const [errorMessage, setErrorMessage] = useState(''); 

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

  useEffect(() => {
    fetchRoomAvailability();
  }, []);

  useEffect(() => {
    if (checkIn && checkOut) {
        const start = new Date(checkIn);
        const end = new Date(checkOut);

        if (end <= start) {
            setDateError(true);
            setErrorMessage('Check-out must be after Check-in');
        } else {
            setDateError(false);
            setErrorMessage('');
            fetchRoomAvailability();
        }
    }
  }, [checkIn, checkOut]);

  const triggerErrorAnimation = (msg: string) => {
    setDateError(true);
    setErrorMessage(msg);
    setShowToast(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if(!checkIn || !checkOut) {
        triggerErrorAnimation('Please select Check-in and Check-out dates first!');
        return;
    }
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (end <= start) {
        triggerErrorAnimation('Check-out date must be after Check-in date!');
        return;
    }
    setDateError(false);
    setShowToast(false);
    fetchRoomAvailability();
  };

  const handleBookAttempt = () => {
    triggerErrorAnimation('Please select Check-in and Check-out dates first!');
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 z-50 fixed inset-0">
        <div className="h-12 w-12 border-4 border-blue-200 border-t-blue-900 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="font-sans text-gray-800 bg-gray-50 min-h-screen flex flex-col">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="flex-grow relative">
      <UserNavbar />
      
      {/* --- ERROR TOAST --- */}
      <AnimatePresence>
        {showToast && (
            <motion.div 
                initial={{ opacity: 0, y: -20, x: "-50%" }}
                animate={{ opacity: 1, y: 20 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="fixed top-24 left-1/2 z-[100] flex items-center gap-3 bg-white border-l-4 border-red-500 px-6 py-4 rounded-r-lg shadow-xl"
            >
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm font-medium text-gray-800">{errorMessage}</p>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- HERO / SEARCH SECTION --- */}
      <div className="relative bg-[#0f172a] pb-32 pt-12 md:pt-24 px-4">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-900/10 blur-3xl"></div>
             <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-indigo-900/10 blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto mb-10">
            <h1 className="text-4xl md:text-6xl font-serif text-white mb-4 leading-tight">Book Your <br/>Perfect Sanctuary</h1>
            <p className="text-gray-400 text-lg max-w-xl">Indulge in comfort and luxury. Select your dates to view our exclusive collection of rooms.</p>
          </div>

          {/* Floating Search Bar - Wide Layout */}
          <div className="relative z-20 max-w-7xl mx-auto">
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className={`bg-white rounded-2xl shadow-xl border p-6 transition-all duration-300 ${dateError ? 'border-red-300 ring-4 ring-red-50' : 'border-gray-100'}`}
            >
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                    
                    {/* Check In */}
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Check In</label>
                        <div className={`flex items-center bg-gray-50 border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 transition-all ${dateError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                            <div className="pl-4 text-gray-400"><Calendar size={18}/></div>
                            <input 
                                type="date" 
                                min={today}
                                value={checkIn}
                                onChange={(e) => setCheckIn(e.target.value)}
                                className="w-full p-3 bg-transparent outline-none text-gray-800 font-medium text-sm"
                            />
                        </div>
                    </div>

                    {/* Check Out */}
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Check Out</label>
                        <div className={`flex items-center bg-gray-50 border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 transition-all ${dateError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                            <div className="pl-4 text-gray-400"><Calendar size={18}/></div>
                            <input 
                                type="date" 
                                min={checkIn || today}
                                value={checkOut}
                                onChange={(e) => setCheckOut(e.target.value)}
                                className="w-full p-3 bg-transparent outline-none text-gray-800 font-medium text-sm"
                            />
                        </div>
                    </div>

                    {/* Search Button - Standard Size */}
                    <div className="w-full md:w-auto">
                        <button 
                            type="submit" 
                            className="w-full md:w-48 p-3.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                        >
                            <Search size={18} />
                            Search
                        </button>
                    </div>
                </form>
            </motion.div>
          </div>
      </div>

      {/* --- RESULTS SECTION --- */}
      <div className="px-4 sm:px-6 lg:px-8 -mt-12 pb-24 relative z-10">
        {/* LAYOUT: Expanded to max-w-7xl for wide screen look */}
        <div className="max-w-7xl mx-auto space-y-8">
          
          {rooms.length === 0 ? (
             <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white rounded-2xl p-10 text-center shadow-lg border border-gray-100 mt-8"
             >
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">No Rooms Displayed</h3>
                <p className="text-gray-500 text-sm">Please select your stay dates above to check availability.</p>
             </motion.div>
          ) : (
            <>
                <div className="flex items-center justify-between px-2 pt-6">
                    <p className="text-gray-500 text-sm">Showing <span className="text-gray-900 font-bold">{rooms.length}</span> results</p>
                </div>

                <div className="space-y-8">
                    {rooms.map((room, index) => (
                        <RoomCard 
                            key={room._id} 
                            room={room} 
                            index={index} 
                            checkIn={checkIn} 
                            checkOut={checkOut} 
                            onBookAttempt={handleBookAttempt}
                        />
                    ))}
                </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
    <Footer />
    </div>
  );
};

export default Booking;