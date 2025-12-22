import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Car, Shield, Coffee, Calendar, Compass, Star, ArrowRight, MessageSquare, Send, Loader2 } from 'lucide-react';
import UserNavbar from "../Header/UserNav.jsx";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast'; 

import Footer from '../Footer/Footer.tsx';

// Define Interface for Review
interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const Userpage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  // 1. Create Refs for scroll detection
  const welcomeRef = useRef(null);
  const featuresRef = useRef(null);
  const exploreRef = useRef(null);
  const locationRef = useRef(null);
  const feedbackRef = useRef(null); 
  const ctaRef = useRef(null);
  
  // 2. Setup InView hooks
  const welcomeInView = useInView(welcomeRef, { once: true, margin: "-100px" });
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });
  const exploreInView = useInView(exploreRef, { once: true, margin: "-100px" });
  const locationInView = useInView(locationRef, { once: true, margin: "-100px" });
  const feedbackInView = useInView(feedbackRef, { once: true, margin: "-100px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" });

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // --- Feedback State ---
  const [displayedReviews, setDisplayedReviews] = useState<Review[]>([]); // Reviews currently shown
  const [viewMode, setViewMode] = useState<'top' | 'all'>('top'); // Toggle state
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    rating: 5,
    comment: ''
  });
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // --- Fetch Reviews Helper ---
  const fetchReviews = async (mode: 'top' | 'all') => {
    setIsLoadingReviews(true);
    try {
      const endpoint = mode === 'top' ? '/top' : '/all';
      const response = await fetch(`http://localhost:5000/api/feedback${endpoint}`);
      if (response.ok) {
        const data = await response.json();
        setDisplayedReviews(data);
      }
    } catch (error) {
      console.error("Failed to fetch reviews", error);
      toast.error("Could not load reviews");
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // Initial Load (Top 3)
  useEffect(() => {
    fetchReviews('top');
  }, []);

  // --- Toggle View Mode ---
  const toggleViewMode = () => {
    const newMode = viewMode === 'top' ? 'all' : 'top';
    setViewMode(newMode);
    fetchReviews(newMode);
  };

  // --- Handle Feedback Submit ---
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackForm.name || !feedbackForm.comment) {
        toast.error("Please fill in all fields");
        return;
    }

    setIsSubmittingFeedback(true);
    try {
        const response = await fetch('http://localhost:5000/api/feedback/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(feedbackForm)
        });

        if (response.ok) {
            toast.success("Thank you for your feedback!");
            setFeedbackForm({ name: '', rating: 5, comment: '' });
            // Refresh the current view
            fetchReviews(viewMode); 
        } else {
            toast.error("Failed to submit feedback");
        }
    } catch (error) {
        toast.error("Server error");
    } finally {
        setIsSubmittingFeedback(false);
    }
  };

  const galleryImages = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  ];

  const exploreLocations = [
    {
      title: "Kataragama Devalaya",
      description: "A sacred pilgrimage site dedicated to God Skanda, revered by Buddhists, Hindus, and Muslims alike.",
      image: "https://www.travelmapsrilanka.com/destinations/destinationimages/kataragama-maha-dewalaya-in-sri-lanka.webp"
    },
    {
      title: "Yala National Park",
      description: "Famous for having one of the highest leopard densities in the world and diverse wildlife safaris.",
      image: "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/7d/07/35.jpg"
    },
    {
      title: "Sella Kataragama",
      description: "A serene location by the Menik Ganga, famous for the Ganapathi Kovil and peaceful surroundings.",
      image: "https://i0.wp.com/amazinglanka.com/wp/wp-content/uploads/2016/02/sellakataragama-06.jpg?ssl=1"
    },
    {
      title: "Wedihiti Kanda",
      description: "The 'Peak of the Veddas', offering a challenging hike and breathtaking panoramic views of the sacred city.",
      image: "https://live.staticflickr.com/69/178178076_4098433a67_z.jpg"
    },
    {
      title: "Kumana National Park",
      description: "A bird watcher's paradise, renowned for its large flocks of migratory waterfowl and wading birds.",
      image: "https://www.kumananationalpark.com/images/kumana1.jpg"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: Car, text: "Free Parking", desc: "Secure parking space" },
    { icon: Shield, text: "24/7 Security", desc: "Round-the-clock safety" },
    { icon: Coffee, text: "Tea/Coffee", desc: "Complimentary beverages" }
  ];

  const handleBooking = () => {
    navigate('/booking');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      <UserNavbar />
      
      {/* Enhanced Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: index === currentImageIndex ? 1 : 0 }}
              transition={{ duration: 1.5 }}
            >
              <img
                src={image}
                alt={`Manjitha Guest ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="relative z-10 text-center text-white px-4 max-w-4xl"
          style={{ y, opacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <div className="flex items-center justify-center gap-2 text-yellow-400 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill="currentColor" />
              ))}
            </div>
            <h1 className="text-6xl md:text-8xl font-bold mb-6 font-serif tracking-tight">
              MANJITHA
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 mx-auto mb-6"></div>
            <p className="text-2xl md:text-3xl font-light tracking-wide">
              Luxury Guest House
            </p>
          </motion.div>
          
          <motion.p 
            className="text-xl md:text-2xl mb-12 font-light max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Experience unparalleled comfort amidst the sacred beauty of Kataragama
          </motion.p>
          
          <motion.button
            onClick={handleBooking}
            className="group relative bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-12 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 shadow-lg overflow-hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center gap-3">
              <Calendar size={24} />
              <span className="tracking-wide">RESERVE YOUR STAY</span>
              <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </motion.button>
        </motion.div>

        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <div className="w-6 h-10 border-2 border-white/80 rounded-full flex justify-center backdrop-blur-sm">
            <motion.div 
              className="w-1 h-3 bg-white rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Enhanced Welcome Section */}
      <section ref={welcomeRef} className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="grid lg:grid-cols-2 gap-16 items-center"
            initial="initial"
            animate={welcomeInView ? "animate" : "initial"}
          >
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={welcomeInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 text-yellow-400 mb-4">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-sm font-semibold tracking-widest uppercase">Welcome</span>
              </div>
              
              <h2 className="text-5xl font-bold text-gray-800 mb-8 font-serif leading-tight">
                Sanctuary in the Heart of Kataragama
              </h2>
              
              <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                <p>
                  Nestled along the serene Sella Kataragama Road, just 300 meters from Kataragama New Town, 
                  Manjitha Guest House offers a tranquil retreat amidst lush greenery. 
                </p>
                <p>
                  Our carefully designed spaces blend modern comfort with traditional charm, creating the perfect 
                  environment for both spiritual pilgrims and nature enthusiasts.
                </p>
              </div>
              
              <div className="flex items-center text-gray-700 mt-8 p-4 bg-gray-50 rounded-2xl">
                <MapPin className="w-6 h-6 mr-4 text-yellow-400" />
                <div>
                  <p className="font-semibold">Sella Kataragama Road</p>
                  <p className="text-sm text-gray-600">Kataragama New Town</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={welcomeInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="grid grid-cols-2 gap-6">
                <motion.img
                  src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Guest House Exterior"
                  className="rounded-2xl shadow-2xl h-80 w-full object-cover"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.img
                  src="https://images.unsplash.com/photo-1584132967334-10e028bd69f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Guest House Garden"
                  className="rounded-2xl shadow-2xl h-80 w-full object-cover mt-12"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section ref={featuresRef} className="py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 text-yellow-400 mb-4">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-sm font-semibold tracking-widest uppercase">Amenities</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-800 mb-6 font-serif">Premium Comforts</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 mx-auto"></div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                className="group text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
              >
                <div className="bg-gradient-to-br from-yellow-400 to-orange-400 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.text}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Explore Section */}
      <section ref={exploreRef} className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={exploreInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center gap-3 mb-4">
              <Compass className="text-yellow-400 w-8 h-8" />
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-sm font-semibold tracking-widest uppercase text-yellow-400">Discover</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-800 mb-6 font-serif">Explore Sacred Kataragama</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 mx-auto mb-4"></div>
            <p className="text-gray-600 text-xl max-w-3xl mx-auto">
              Immerse yourself in the spiritual and natural wonders surrounding our guest house
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {exploreLocations.map((loc, index) => (
              <motion.div 
                key={index}
                className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer shadow-2xl"
                initial={{ opacity: 0, y: 30 }}
                animate={exploreInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <img 
                  src={loc.image} 
                  alt={loc.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform transition-all duration-500 group-hover:translate-y-[-50%]">
                  <h3 className="text-2xl font-bold mb-3">{loc.title}</h3>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                    <p className="text-gray-200 leading-relaxed">{loc.description}</p>
                  </div>
                </div>
                
                <div className="absolute top-6 right-6">
                  <div className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold transform translate-x-8 group-hover:translate-x-0 transition-transform duration-500">
                    Explore
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section ref={locationRef} className="py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="grid lg:grid-cols-2 gap-16 items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={locationInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            {/* Text Content */}
            <div>
              <div className="inline-flex items-center gap-2 text-yellow-400 mb-4">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-sm font-semibold tracking-widest uppercase">Location</span>
              </div>
              
              <h2 className="text-5xl font-bold text-gray-800 mb-8 font-serif leading-tight">
                Find Your Way to Serenity
              </h2>
              
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Located just minutes from the sacred Kataragama Temple, our guest house provides a peaceful base for your pilgrimage. We are easily accessible via the Sella Kataragama Road.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">Our Address</h4>
                    <p className="text-gray-600">
                      2 Kataragama-Sella Kataragama Road,<br />
                      Kataragama 91400, Sri Lanka
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
                    <Car size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">Arrival</h4>
                    <p className="text-gray-600">
                      Free private parking is available on site.<br />
                      300m from Kataragama New Town.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Frame */}
            <motion.div 
              className="h-[500px] w-full bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5 }}
            >
              <iframe 
                title="Manjitha Guest House Location"
                width="100%" 
                height="100%" 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4022.8069036274014!2d81.32385181654963!3d6.416776808044096!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae427ae14712abd%3A0x4dc5fd3890d0bb9c!2sMANJITHA%20Guest!5e1!3m2!1sen!2slk!4v1764560129890!5m2!1sen!2slk"
                style={{ border: 0, filter: "grayscale(0.1)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* FEEDBACK SECTION */}
      {/* ---------------------------------------------------------------------- */}
      <section ref={feedbackRef} className="py-24 bg-white overflow-hidden relative">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-yellow-50/50 skew-x-12 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
            <motion.div 
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                animate={feedbackInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6 }}
            >
                <div className="inline-flex items-center gap-2 text-yellow-400 mb-4">
                    <MessageSquare size={16} />
                    <span className="text-sm font-semibold tracking-widest uppercase">Guest Reviews</span>
                </div>
                <h2 className="text-5xl font-bold text-gray-800 mb-6 font-serif">Stories of Satisfaction</h2>
                <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 mx-auto"></div>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-16">
                
                {/* LEFT: Feedback Form */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={feedbackInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                    transition={{ duration: 0.8 }}
                    className="bg-gray-50 p-8 rounded-3xl shadow-lg border border-gray-100 h-fit"
                >
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Share Your Experience</h3>
                    <p className="text-gray-500 mb-6">We value your opinion. Let us know how your stay was.</p>

                    <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
                            <input 
                                type="text"
                                className="w-full p-4 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
                                placeholder="John Doe"
                                value={feedbackForm.name}
                                onChange={(e) => setFeedbackForm({...feedbackForm, name: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Your Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setFeedbackForm({...feedbackForm, rating: star})}
                                        className={`p-2 rounded-full transition-all ${feedbackForm.rating >= star ? 'text-yellow-400 scale-110' : 'text-gray-300'}`}
                                    >
                                        <Star size={32} fill="currentColor" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Your Comment</label>
                            <textarea 
                                className="w-full p-4 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-yellow-400 outline-none transition-all h-32 resize-none"
                                placeholder="Tell us about your stay..."
                                value={feedbackForm.comment}
                                onChange={(e) => setFeedbackForm({...feedbackForm, comment: e.target.value})}
                            ></textarea>
                        </div>

                        <button 
                            type="submit"
                            disabled={isSubmittingFeedback}
                            className={`w-full py-4 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all ${isSubmittingFeedback ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmittingFeedback ? 'Sending...' : (
                                <>
                                    Submit Feedback <Send size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* RIGHT: Reviews Display Area */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={feedbackInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex flex-col h-[600px]" // Fixed height for scroll area
                >
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">Guest Favorites</h3>
                            <p className="text-yellow-500 font-semibold text-sm mt-1">
                                {viewMode === 'top' ? 'Showing Top 5-Star Ratings' : 'Showing All Reviews'}
                            </p>
                        </div>
                        <button 
                            onClick={toggleViewMode}
                            className="text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
                        >
                            {viewMode === 'top' ? (
                                <>View All Reviews <ArrowRight size={16} /></>
                            ) : (
                                <>Show Top Only <Star size={16} /></>
                            )}
                        </button>
                    </div>

                    {/* Scrollable Container */}
                    <div className="space-y-4 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                        {isLoadingReviews ? (
                            <div className="h-full flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
                            </div>
                        ) : displayedReviews.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-3xl border border-dashed border-gray-300 text-gray-400">
                                <MessageSquare size={48} className="mb-4 opacity-20" />
                                <p>No reviews found yet.</p>
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {displayedReviews.map((review, idx) => (
                                    <motion.div 
                                        key={review._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-lg uppercase">
                                                    {review.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{review.name}</h4>
                                                    <div className="flex gap-0.5 text-yellow-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star 
                                                                key={i} 
                                                                size={12} 
                                                                fill={i < review.rating ? "currentColor" : "none"} 
                                                                className={i < review.rating ? "" : "text-gray-300"}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm italic leading-relaxed">"{review.comment}"</p>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section ref={ctaRef} className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 text-yellow-400 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={24} fill="currentColor" />
              ))}
            </div>
            
            <h2 className="text-5xl font-bold text-white mb-8 font-serif leading-tight">
              Your Sanctuary Awaits
            </h2>
            
            <motion.p 
              className="text-gray-300 text-xl mb-12 leading-relaxed max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={ctaInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Experience the perfect harmony of luxury and spirituality in the heart of Kataragama
            </motion.p>
            
            <motion.button
              onClick={handleBooking}
              className="group relative bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-16 py-5 rounded-full font-bold text-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={ctaInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center gap-4">
                <Calendar size={28} />
                <span className="tracking-wider">BOOK YOUR STAY NOW</span>
                <ArrowRight size={24} className="transform group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </motion.button>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
    
  );
};

export default Userpage;