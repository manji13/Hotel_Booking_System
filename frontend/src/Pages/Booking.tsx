import { useState, useEffect, useCallback } from 'react';
import { BedDouble, Users, DollarSign, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import UserNavbar from "../Header/UserNav.jsx";

interface Room {
  _id: string;
  roomType: string;
  images: string[];
  beds: number;
  capacity: number;
  price: number;
  description: string;
  availableCount: number; // --- Added field ---
}

// Helper to construct image URL
const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const cleanPath = imagePath.replace(/\\/g, '/');
  const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  return `http://localhost:5000${finalPath}`;
};

// --- Individual Room Card Component ---
const RoomCard = ({ room, index }: { room: Room; index: number }) => {
  const navigate = useNavigate();
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [direction, setDirection] = useState(0);

  const hasMultipleImages = room.images && room.images.length > 1;
  const isSoldOut = room.availableCount < 1; // Check availability

  // --- Navigation Logic ---
  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrentImgIdx((prev) => {
      let nextIndex = prev + newDirection;
      if (nextIndex < 0) nextIndex = room.images.length - 1;
      if (nextIndex >= room.images.length) nextIndex = 0;
      return nextIndex;
    });
  }, [room.images.length]);

  // --- Auto-Change Images Effect ---
  useEffect(() => {
    if (!hasMultipleImages) return;
    const timer = setInterval(() => {
      paginate(1);
    }, 5000); // Change every 5 seconds
    return () => clearInterval(timer);
  }, [hasMultipleImages, paginate]);

  // --- Animation Variants ---
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  const handleBookClick = () => {
    if (!isSoldOut) {
        navigate(`/booking/${room._id}`, { state: { room } });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`flex flex-col md:flex-row gap-6 items-center bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
    >
      
      {/* Left Side: Image Carousel (Compact Height) */}
      <div 
        className={`w-full md:w-5/12 h-[220px] md:h-[260px] overflow-hidden relative rounded-lg bg-gray-100 ${!isSoldOut ? 'cursor-pointer' : 'cursor-not-allowed grayscale'}`}
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
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              alt={room.roomType}
              className="absolute w-full h-full object-cover"
              onError={(e) => (e.target as HTMLImageElement).src = "https://via.placeholder.com/600x400?text=No+Image"}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
          )}
        </AnimatePresence>

        {/* Sold Out Overlay on Image */}
        {isSoldOut && (
            <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center">
                <span className="bg-red-600 text-white px-4 py-2 font-bold uppercase tracking-widest text-sm rounded shadow-lg">Sold Out</span>
            </div>
        )}

        {/* Navigation Arrows */}
        {hasMultipleImages && !isSoldOut && (
          <>
            <button 
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 hover:opacity-100 transition-all z-10 text-gray-800"
              onClick={(e) => { e.stopPropagation(); paginate(-1); }}
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 hover:opacity-100 transition-all z-10 text-gray-800"
              onClick={(e) => { e.stopPropagation(); paginate(1); }}
            >
              <ChevronRight size={18} />
            </button>
            
            {/* Compact Dots Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {room.images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentImgIdx ? 'bg-white scale-110' : 'bg-white/50'}`} 
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right Side: Content (Compact) */}
      <div className="w-full md:w-7/12 flex flex-col justify-center text-left space-y-3 px-2">
        
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-medium tracking-wide text-gray-800">
                {room.roomType}
            </h2>
            {/* Availability Badge */}
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
          
          <span className="text-sm font-semibold text-[#1a2b49] bg-blue-50 px-3 py-1 rounded-full">
            ${room.price} <span className="text-xs font-normal text-gray-500">/ night</span>
          </span>
        </div>

        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
          {room.description || "Experience luxury and comfort in our carefully designed rooms."}
        </p>

        {/* Icons Row */}
        <div className="flex items-center gap-6 py-3 border-t border-gray-100 mt-2">
          <div className="flex items-center gap-2 text-gray-600">
            <BedDouble size={18} className="text-[#1a2b49]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {room.beds} Beds
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Users size={18} className="text-[#1a2b49]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Max {room.capacity}
            </span>
          </div>
        </div>

        {/* Button */}
        <div className="pt-1">
          <button 
            onClick={handleBookClick}
            disabled={isSoldOut}
            className={`w-full md:w-auto px-6 py-2.5 text-[11px] font-bold tracking-[0.15em] uppercase transition-colors rounded shadow-sm
                ${isSoldOut 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-[#1a2b49] text-white hover:bg-[#2c4a7c]'
                }`}
          >
            {isSoldOut ? 'Sold Out' : 'View Details'}
          </button>
        </div>

      </div>
    </motion.div>
  );
};

const Booking = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // Add a minimum delay to show the beautiful loader (optional, remove setTimeout to make it instant)
        const minLoadTime = new Promise(resolve => setTimeout(resolve, 1500));
        const apiCall = fetch('http://localhost:5000/api/rooms').then(res => res.json());
        
        const [data] = await Promise.all([apiCall, minLoadTime]);
        setRooms(data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // --- Custom M Logo Loading Animation ---
  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 z-50 fixed inset-0">
      <div className="flex flex-col items-center space-y-4">
        {/* Pulsing Container */}
        <div className="bg-blue-50 p-5 rounded-full animate-pulse shadow-sm">
          {/* M Logo SVG */}
          <svg 
            viewBox="0 0 100 100" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="12" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="w-12 h-12 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M22 80V25L50 53L78 25V80" />
          </svg>
        </div>
        
        {/* Bouncing Dots */}
        <div className="flex space-x-2">
          <div className="h-2.5 w-2.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-2.5 w-2.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-2.5 w-2.5 bg-blue-600 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50"
    >
      <style>{`
        @keyframes gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-banner {
          background: linear-gradient(-45deg, #fef9c3, #e0f2fe, #fef08a, #bae6fd);
          background-size: 400% 400%;
          animation: gradient-flow 12s ease infinite;
        }
      `}</style>

      <UserNavbar />
      <div className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-10">
          
          {/* --- NEW ANIMATED BANNER --- */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="animated-banner w-full py-16 rounded-2xl shadow-lg text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]"></div>
            <div className="relative z-10 px-4">
              <h1 className="text-4xl md:text-5xl font-light text-[#1a2b49] uppercase tracking-widest mb-4 drop-shadow-sm">
                Our Rooms
              </h1>
              <div className="w-24 h-1 bg-[#1a2b49] mx-auto rounded-full mb-4 opacity-80"></div>
              <p className="text-[#1a2b49] font-medium text-sm md:text-base opacity-80 max-w-xl mx-auto">
                Discover serenity and elegance in every corner.
              </p>
            </div>
          </motion.div>
          {/* --------------------------- */}

          {rooms.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-10">No rooms available at the moment.</div>
          ) : (
            <div className="space-y-6">
              {rooms.map((room, index) => (
                <RoomCard key={room._id} room={room} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Booking;