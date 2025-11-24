import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Rocket, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // State for form submission loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for initial page loading (The . . . animation)
  const [isPageLoading, setIsPageLoading] = useState(true);

  const navigate = useNavigate();
  const { name, email, password } = formData;

  // Simulate loading when page opens
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1500); // Show loader for 1.5 seconds
    return () => clearTimeout(timer);
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
        toast.success('Account created successfully! Redirecting...', {
            duration: 3000,
            icon: '🎉',
        });
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
  // LOADING SCREEN (The Blue . . . Animation with M Icon)
  // ---------------------------------------------------------
  if (isPageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          {/* M Brand Icon Pulse */}
          <div className="bg-blue-50 p-4 rounded-full animate-pulse">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-10 w-10 text-blue-600"
            >
              <path d="M21 21V3l-9 9-9-9v18" />
            </svg>
          </div>
          
          {/* Professional Bouncing Dots Animation */}
          <div className="flex space-x-2">
            <div className="h-3 w-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-3 w-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-3 w-3 bg-blue-600 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // MAIN CONTENT
  // ---------------------------------------------------------
  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* LEFT SIDE - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-blue-600 justify-around items-center text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 opacity-90"></div>
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-400 opacity-50 mix-blend-multiply blur-xl"></div>
         <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-blue-400 opacity-40 mix-blend-multiply blur-2xl"></div>

        <div className="relative z-10 flex flex-col items-center text-center px-10">
          <div className="bg-white/20 p-4 rounded-full mb-6 backdrop-blur-sm">
            <Rocket size={64} className="text-white" />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight mb-4">
            Welcome to Our Hotel
          </h2>
          <p className="text-blue-100 max-w-md text-lg">
            Join us today to book luxurious rooms and enjoy an unforgettable experience. Your journey begins here.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="flex w-full lg:w-1/2 justify-center items-center bg-white px-6 py-12 lg:px-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-left">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Please fill in your details to get started.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={onSubmit}>
            <div className="space-y-5">
              
              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                    placeholder="John Doe"
                    value={name}
                    onChange={onChange}
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                    placeholder="john@example.com"
                    value={email}
                    onChange={onChange}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                    placeholder="••••••••"
                    value={password}
                    onChange={onChange}
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                  I agree with the <a href="#" className="text-blue-600 hover:text-blue-500">Terms & Conditions</a>
                </label>
              </div>

            </div>

            {/* Buttons Section */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                 {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                 {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full flex justify-center py-3 px-4 border-2 border-blue-600 font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;