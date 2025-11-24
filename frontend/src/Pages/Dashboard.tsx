import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Car, Shield, Coffee, Calendar, ShieldAlert, X } from 'lucide-react';
import HomeNav from '../Header/HomeNav.tsx';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
};

const slideInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
};

const slideInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
};

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  // Refs for scroll animations
  const welcomeRef = useRef(null);
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);
  
  // Check if elements are in view
  const welcomeInView = useInView(welcomeRef, { once: true, margin: "-100px" });
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" });

  // Parallax scroll effect for hero
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Sample images - replace with your actual guest house images
  const galleryImages = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG90ZWwlMjByb29tfGVufDB8fDB8fHww&w=1000&q=80",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aG90ZWwlMjByb29tfGVufDB8fDB8fHww&w=1000&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGhvdGVsJTIwcm9vbXxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: Car, text: "Free Parking" },
    { icon: Shield, text: "24/7 Security" },
    { icon: Coffee, text: "Tea/Coffee Maker" }
  ];

  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleCheckAvailability = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault(); // Stop navigation
      setShowAuthModal(true);
    } else {
      navigate('/booking');
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
    <div className="min-h-screen bg-white">
      <HomeNav />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Image Slider */}
        <div className="absolute inset-0">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image}
                alt={`Manjitha Guest ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          ))}
        </div>

        {/* Hero Content with Parallax */}
        <motion.div 
          className="relative z-10 text-center text-white px-4 max-w-4xl"
          style={{ y, opacity }}
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 font-serif"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            MANJITHA GUEST
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl mb-8 font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Kataragama
          </motion.p>
          
          <motion.div 
            className="w-24 h-1 bg-yellow-400 mx-auto mb-8"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          />
          
          <motion.p 
            className="text-lg md:text-xl mb-8 leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Experience Serenity Amidst Nature's Embrace
          </motion.p>
          
          <motion.button
            onClick={handleCheckAvailability}
            className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Calendar size={20} />
            Check Availability
          </motion.button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <motion.div 
              className="w-1 h-3 bg-white rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Welcome Section */}
      <section ref={welcomeRef} className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="grid md:grid-cols-2 gap-12 items-center"
            variants={staggerContainer}
            initial="initial"
            animate={welcomeInView ? "animate" : "initial"}
          >
            <motion.div variants={fadeInUp}>
              <motion.h2 
                className="text-4xl font-bold text-gray-800 mb-6 font-serif"
                variants={fadeInUp}
              >
                Welcome to Manjitha Guest House
              </motion.h2>
              
              <motion.div 
                className="w-20 h-1 bg-yellow-400 mb-6"
                variants={fadeInUp}
              />
              
              <motion.p 
                className="text-lg text-gray-600 leading-relaxed mb-6"
                variants={fadeInUp}
              >
                We welcome you to Manjitha Guest House. You can check in at our guest house after arriving at Sella Kataragama Road, about 300 meters from Kataragama New Town. If you are looking for a peaceful place amidst the trees, Manjitha Guest House is the right place for it.
              </motion.p>
              
              <motion.p 
                className="text-lg text-gray-600 leading-relaxed mb-8"
                variants={fadeInUp}
              >
                We also provide tourist friendliness and security. If you are looking for a place to stay freely and close to the temple, Manjitha Guest House is the right place...
              </motion.p>
              
              <motion.div 
                className="flex items-center text-gray-600 mb-4"
                variants={fadeInUp}
              >
                <MapPin className="w-5 h-5 mr-3 text-yellow-400" />
                <span>Sella Kataragama Road, Kataragama New Town</span>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-2 gap-4"
              variants={staggerContainer}
            >
              <motion.img
                src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z3Vlc3QlMjBob3VzZXxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80"
                alt="Guest House Exterior"
                className="rounded-lg shadow-lg h-64 w-full object-cover"
                variants={slideInRight}
              />
              <motion.img
                src="https://images.unsplash.com/photo-1584132967334-10e028bd69f7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Z3Vlc3QlMjBob3VzZXxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80"
                alt="Guest House Garden"
                className="rounded-lg shadow-lg h-64 w-full object-cover mt-8"
                variants={slideInRight}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4 font-serif">Our Amenities</h2>
            <motion.div 
              className="w-20 h-1 bg-yellow-400 mx-auto"
              initial={{ width: 0 }}
              animate={featuresInView ? { width: 80 } : { width: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
            <motion.p 
              className="text-gray-600 mt-4 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={featuresInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Everything you need for a comfortable and memorable stay
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            animate={featuresInView ? "animate" : "initial"}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                className="text-center group"
                variants={scaleIn}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-yellow-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-100 transition-colors duration-300">
                  <feature.icon className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="font-semibold text-gray-800">{feature.text}</h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20 bg-gradient-to-r from-yellow-400 to-yellow-500 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6 font-serif">
              Ready for a Peaceful Stay?
            </h2>
            <motion.p 
              className="text-white text-xl mb-8 opacity-90"
              initial={{ opacity: 0 }}
              animate={ctaInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Book your room now and experience the perfect blend of comfort and nature
            </motion.p>
            <motion.button
              onClick={handleCheckAvailability}
              className="inline-flex items-center gap-2 bg-white text-yellow-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={ctaInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Calendar size={20} />
              Check Availability
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Beautiful Centered Authentication Modal */}
      {showAuthModal && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop with blur */}
          <motion.div 
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={closeModal}
          />
          
          {/* Modal Content */}
          <motion.div 
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 25 }}
          >
            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-xl opacity-20 animate-pulse" />
            
            {/* Main Card */}
            <div className="relative bg-white/95 p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center space-y-6 max-w-md w-full mx-4 border border-white/20">
              
              {/* Close Button */}
              <motion.button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-all duration-300 text-gray-400 hover:text-gray-600"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>
              
              {/* Animated Icon Container */}
              <motion.div 
                className="relative"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                {/* Outer Ring Animation */}
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75" />
                {/* Middle Ring */}
                <div className="absolute inset-0 bg-blue-200 rounded-full animate-pulse opacity-50" />
                {/* Icon Background */}
                <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-full shadow-lg">
                  <ShieldAlert size={32} className="text-white" />
                </div>
              </motion.div>

              {/* Text Content with Animation */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Authentication Required
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Please <span className="font-semibold text-blue-600">register</span> or <span className="font-semibold text-blue-600">login</span> to continue with your booking
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-3 w-full pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <motion.button
                  onClick={() => handleAuthAction('/register')}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Register Now
                </motion.button>
                <motion.button
                  onClick={() => handleAuthAction('/login')}
                  className="flex-1 border-2 border-blue-200 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:border-blue-600 hover:bg-blue-50 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Login
                </motion.button>
              </motion.div>

              {/* Continue without account */}
              <motion.button
                onClick={closeModal}
                className="text-sm text-gray-500 hover:text-gray-700 transition-all duration-300 underline"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Maybe later
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Home;