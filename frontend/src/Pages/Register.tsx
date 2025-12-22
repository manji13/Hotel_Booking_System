import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, User, ArrowRight, MapPin, Phone, Globe } from 'lucide-react';

// Background images array for the slideshow
const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1571896349842-6e53ce41e86a?q=80&w=2133&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"  
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // State for form submission loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for initial page loading
  const [isPageLoading, setIsPageLoading] = useState(true);

  // State for Success Animation
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // State for background slideshow
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  const navigate = useNavigate();
  const { name, email, password } = formData;

  // Simulate loading when page opens
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1500); 
    return () => clearTimeout(timer);
  }, []);

  // Background Slider Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % BACKGROUND_IMAGES.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast.error("Please agree to the Terms & Conditions");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data));
        
        // ------------------------------------------------
        // SUCCESS ANIMATION TRIGGER
        // ------------------------------------------------
        setShowSuccessModal(true);

        // Redirect after animation (2 seconds)
        setTimeout(() => navigate('/login'), 2000);

      } else {
        toast.error(data.message || 'Registration failed');
        setIsSubmitting(false);
      }
    } catch (error) {
      toast.error('Server connection failed. Please try again later.');
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // LOADING SCREEN 
  // ---------------------------------------------------------
  if (isPageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 z-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-white/10 p-4 rounded-full animate-pulse backdrop-blur-md">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-10 w-10 text-white"
            >
              <path d="M21 21V3l-9 9-9-9v18" />
            </svg>
          </div>
          <div className="flex space-x-2">
            <div className="h-3 w-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-3 w-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-3 w-3 bg-blue-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // MAIN CONTENT
  // ---------------------------------------------------------
  return (
    <div className="relative min-h-screen flex flex-col font-sans text-gray-800 selection:bg-blue-500 selection:text-white overflow-x-hidden">
      
      {/* -------------------------------------------------------
        SUCCESS MODAL OVERLAY (Triggers on Register Success)
        -------------------------------------------------------
      */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          
          {/* 1. The Blur Background Layer */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-[fadeIn_0.5s_ease-out]"></div>

          {/* 2. The Centered Pop-Up Message */}
          <div className="relative z-10 p-8 text-center animate-[popIn_0.6s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-10 rounded-[2rem] shadow-2xl transform">
               <div className="mb-4 flex justify-center">
                 <div className="bg-green-500/20 p-4 rounded-full">
                    <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                 </div>
               </div>
               <h2 className="text-3xl font-black text-white mb-2 drop-shadow-lg">
                 Success!
               </h2>
               <p className="text-xl text-blue-200 font-semibold mb-1">
                 Account Created Successfully
               </p>
               <p className="text-sm text-gray-300">
                 Redirecting...
               </p>
               <div className="mt-6 flex justify-center space-x-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></span>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* BACKGROUND SLIDESHOW LAYER */}
      <div className="fixed inset-0 z-0">
        {BACKGROUND_IMAGES.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
              index === currentBgIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        {/* Darker Overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      {/* ------------------------------------------------ */}
      {/* TOP LEFT LOGO                                    */}
      {/* ------------------------------------------------ */}
      <div className="absolute top-6 left-6 z-50">
        <Link to="/" className="group flex items-center gap-3 transition-transform hover:scale-105">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md border border-white/30 shadow-lg group-hover:bg-white/30 transition-all">
                <span className="text-2xl font-black text-white">M</span>
            </div>
        </Link>
      </div>

      {/* CENTERED CONTENT LAYER */}
      <div className="relative z-10 flex-grow flex items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
        
        {/* ANIMATED FORM CARD */}
        <div className="w-full max-w-md transform transition-all duration-700 ease-out translate-y-0 opacity-100 animate-[fadeInUp_0.8s_ease-out]">
          
          <div className="bg-white/30 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-3xl overflow-hidden border border-white/40">
            <div className="px-8 py-10">
              
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
                  Join Our Hotel
                </h2>
                <p className="mt-2 text-sm text-blue-50 font-medium">
                  Create an account to book your luxury stay
                </p>
              </div>

              {/* Form */}
              <form className="space-y-6" onSubmit={onSubmit}>
                
                {/* Name */}
                <div className="group">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-700 group-focus-within:text-blue-700 transition-colors" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="block w-full pl-10 pr-3 py-3 bg-white/60 border border-white/50 rounded-xl leading-5 placeholder-gray-600 focus:outline-none focus:bg-white/90 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 shadow-sm"
                      placeholder="Full Name"
                      value={name}
                      onChange={onChange}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="group">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-700 group-focus-within:text-blue-700 transition-colors" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="block w-full pl-10 pr-3 py-3 bg-white/60 border border-white/50 rounded-xl leading-5 placeholder-gray-600 focus:outline-none focus:bg-white/90 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 shadow-sm"
                      placeholder="Email Address"
                      value={email}
                      onChange={onChange}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="group">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-700 group-focus-within:text-blue-700 transition-colors" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="block w-full pl-10 pr-3 py-3 bg-white/60 border border-white/50 rounded-xl leading-5 placeholder-gray-600 focus:outline-none focus:bg-white/90 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 shadow-sm"
                      placeholder="Password"
                      value={password}
                      onChange={onChange}
                    />
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-800 font-medium cursor-pointer">
                    I agree with the <a href="#" className="text-blue-700 font-bold hover:text-blue-800 underline">Terms & Conditions</a>
                  </label>
                </div>

                {/* Buttons */}
                <div className="space-y-4 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`group relative w-full flex justify-center items-center py-3 px-4 border border-transparent font-bold rounded-xl text-white bg-blue-600/90 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg transform transition-all duration-200 hover:scale-[1.02] ${isSubmitting ? 'opacity-80 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                       <span className="flex items-center">
                         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                         Creating Account...
                       </span>
                    ) : (
                      <>
                        Sign Up
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  
                  {/* CLEAN OR SECTION */}
                  <div className="flex items-center gap-4 my-4">
                    <div className="h-px bg-gray-300 flex-1 opacity-60"></div>
                    <span className="text-gray-800 text-sm font-bold uppercase">OR</span>
                    <div className="h-px bg-gray-300 flex-1 opacity-60"></div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="w-full flex justify-center py-3 px-4 border-2 border-white/60 font-semibold rounded-xl text-gray-800 bg-white/40 hover:bg-white hover:border-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
                  >
                    Already have an account? Sign In
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="relative w-full z-20 py-6 bg-gray-900/90 backdrop-blur-md border-t border-white/10 text-white/80 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center space-y-3 md:space-y-0 text-xs sm:text-sm text-center">
           
           <div className="flex items-center space-x-2 px-3 md:border-r md:border-white/20">
             <span className="font-semibold text-blue-200">Hotel Name:</span> 
             <span>Manjitha Kavishan</span>
           </div>

           <div className="flex items-center space-x-2 px-3 md:border-r md:border-white/20">
             <Phone size={14} className="text-blue-400" />
             <span className="font-semibold text-blue-200">Contact:</span> 
             <span>+94 76 468 7979</span>
           </div>

           <div className="flex items-center space-x-2 px-3 md:border-r md:border-white/20">
             <MapPin size={14} className="text-blue-400" />
             <span className="font-semibold text-blue-200">Location:</span> 
             <span>Kataragama</span>
           </div>

           <div className="flex items-center space-x-2 px-3">
             <Globe size={14} className="text-blue-400" />
             <span className="font-semibold text-blue-200">Site created:</span> 
             <span>@2025</span>
           </div>

        </div>
      </footer>

      {/* Animation Style injection */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate3d(0, 50px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.5); }
          70% { transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Register;