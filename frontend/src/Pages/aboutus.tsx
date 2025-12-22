import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { MapPin, Users, Wind, CheckCircle, Heart, Shield } from 'lucide-react';
import UserNavbar from "../Header/UserNav";
import Footer from "../Footer/Footer";

// Placeholder images
const section1Images = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1325&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1470&auto=format&fit=crop"
];

const section2Images = [
  "https://cdn.lakpura.com/images/LK94D6131B-01-E.JPG", 
  "https://img.freepik.com/free-photo/leopard-resting-tree-branch_23-2152007099.jpg?semt=ais_hybrid&w=740&q=80",
  "https://cdn.prod.rexby.com/image/ec780b7e30e44fa9994029c03567c5c4?format=webp&width=1080&height=1350"
];

const AboutUs = () => {
  const [currentImageIndex1, setCurrentImageIndex1] = useState(0);
  const [currentImageIndex2, setCurrentImageIndex2] = useState(0);

  // Image Slider 1 Interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex1((prev) => (prev + 1) % section1Images.length);
    }, 4000); 
    return () => clearInterval(interval);
  }, []);

  // Image Slider 2 Interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex2((prev) => (prev + 1) % section2Images.length);
    }, 4500); 
    return () => clearInterval(interval);
  }, []);

  // --- Animation Settings (Re-triggers on scroll up/down) ---
  const scrollAnimation: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <UserNavbar />
      
      <main className="pt-20 pb-12">
        
        {/* --- HEADER BANNER (Blue-Green Gradient) --- */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 py-14 text-center text-white mb-16 shadow-lg">
            <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-3xl md:text-4xl font-bold tracking-tight"
            >
                About Manjitha Guest
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="mt-2 text-blue-50 text-base font-medium"
            >
                Your peaceful sanctuary in Kataragama
            </motion.p>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">

          {/* SECTION 1: Introduction */}
          <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }} // once: false allows re-animation
            variants={scrollAnimation}
            className="grid md:grid-cols-2 gap-10 items-center"
          >
            <div className="space-y-5 order-2 md:order-1">
              <div className="flex items-center gap-2 text-teal-600 font-bold uppercase tracking-wider text-xs">
                <Heart size={16} />
                <span>Welcome Stay</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">Experience Comfort & Warmth</h2>
              <div className="space-y-4 text-gray-600 text-sm md:text-base leading-relaxed text-justify">
                <p>
                  Manjitha Guest is a comfortable and welcoming guest house located in the heart of Kataragama, just 300 meters from the Kataragama sacred area. Situated at No. 02, Hansa Mawatha, Sella Road, Kataragama – 91400, our guest house offers easy access from the Sella Main Road, making it convenient for both pilgrims and travelers.
                </p>
                <p>
                  Designed to provide a calm and relaxing stay, Manjitha Guest is an ideal choice for those visiting Kataragama for religious, spiritual, or leisure purposes. Our peaceful surroundings and friendly atmosphere ensure a pleasant and restful experience for every guest.
                </p>
              </div>
            </div>

            <div className="h-[350px] relative rounded-2xl overflow-hidden shadow-xl order-1 md:order-2 cursor-pointer group border-4 border-white">
              <AnimatePresence mode='wait'>
                <motion.img
                  key={currentImageIndex1}
                  src={section1Images[currentImageIndex1]}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  alt="Manjitha Guest Ambiance"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </AnimatePresence>
            </div>
          </motion.section>


          {/* SECTION 2: Location & Spiritual Importance */}
          <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            variants={scrollAnimation}
            className="grid md:grid-cols-2 gap-10 items-center"
          >
            <div className="h-[350px] relative rounded-2xl overflow-hidden shadow-xl cursor-pointer group border-4 border-white">
               <AnimatePresence mode='wait'>
                <motion.img
                  key={currentImageIndex2}
                  src={section2Images[currentImageIndex2]}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  alt="Kataragama surroundings"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </AnimatePresence>
            </div>

             <div className="space-y-5">
              <div className="flex items-center gap-2 text-teal-600 font-bold uppercase tracking-wider text-xs">
                <MapPin size={16} />
                <span>Prime Location</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">Location & Spiritual Importance</h2>
              <div className="space-y-4 text-gray-600 text-sm md:text-base leading-relaxed text-justify">
                <p>
                  Our hotel is ideally situated for pilgrims and travelers visiting the Ruhunu Maha Kataragama Devalaya, Kirivehera, and other sacred sites, making your spiritual journey comfortable and stress-free.
                </p>
                <p>
                  We understand the significance of your visit and strive to provide an environment that complements your spiritual goals.
                </p>
              </div>
            </div>
          </motion.section>


          {/* SECTION 3: Accommodation & Comfort */}
          <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            variants={scrollAnimation}
            className="bg-white rounded-2xl p-8 md:p-10 shadow-lg border border-gray-100 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-teal-400"></div>
            
            <div className="text-center mb-10">
                 <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Accommodation & Comfort</h2>
                 <p className="text-gray-500 mt-2 text-sm">Designed for your relaxation</p>
            </div>
           
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Feature 1 */}
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="flex flex-col items-center text-center p-6 bg-blue-50/50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-300"
                >
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600 mb-3 shadow-sm">
                        <Shield size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Clean Rooms</h3>
                    <p className="text-gray-600 text-sm">Spotless & hygienic environment</p>
                </motion.div>
                 
                 {/* Feature 2 */}
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="flex flex-col items-center text-center p-6 bg-teal-50/50 rounded-xl border border-teal-100 hover:shadow-md transition-all duration-300"
                >
                    <div className="bg-teal-100 p-3 rounded-full text-teal-600 mb-3 shadow-sm">
                        <Users size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Family-friendly</h3>
                    <p className="text-gray-600 text-sm">Safe environment for loved ones</p>
                </motion.div>
                 
                 {/* Feature 3 */}
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="flex flex-col items-center text-center p-6 bg-indigo-50/50 rounded-xl border border-indigo-100 hover:shadow-md transition-all duration-300"
                >
                    <div className="bg-indigo-100 p-3 rounded-full text-indigo-600 mb-3 shadow-sm">
                        <Wind size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">AC / Non-AC</h3>
                    <p className="text-gray-600 text-sm">Climate control choices</p>
                </motion.div>
            </div>
          </motion.section>


          {/* SECTION 4: Mission / Values */}
          <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.5 }}
            variants={scrollAnimation}
            className="bg-gray-100 rounded-2xl p-10 text-center relative"
          >
             <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-lg md:text-xl text-gray-700 font-serif italic leading-relaxed">
                "Our mission is to provide a calm, clean, and welcoming environment for pilgrims and travelers, while respecting the spiritual significance of Kataragama."
                </p>
             </div>
          </motion.section>


          {/* SECTION 5: Why Choose Us */}
          <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            variants={scrollAnimation}
            className="text-center pb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Why Choose Manjitha Guest?</h2>
            
            <div className="max-w-xl mx-auto grid gap-3">
                {[
                    "Close proximity to Kataragama Temple",
                    "Peaceful & natural surroundings",
                    "Clean & comfortable rooms",
                    "Affordable prices",
                    "Friendly service"
                ].map((item, index) => (
                    <motion.div 
                        key={index}
                        whileHover={{ scale: 1.01, x: 5 }}
                        className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-teal-200 transition-all cursor-default"
                    >
                        <div className="bg-teal-50 p-1.5 rounded-full">
                            <CheckCircle className="text-teal-600 flex-shrink-0" size={18} />
                        </div>
                        <span className="text-sm md:text-base font-medium text-gray-700">{item}</span>
                    </motion.div>
                ))}
            </div>
          </motion.section>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;