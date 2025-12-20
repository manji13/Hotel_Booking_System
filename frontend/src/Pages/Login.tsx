import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, Rocket, ArrowRight } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  // Separate animation states for precise choreography
  const [showPanels, setShowPanels] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const navigate = useNavigate();
  const { email, password } = formData;

  useEffect(() => {
    // 1. Show Loader for 1.5s
    const loaderTimer = setTimeout(() => {
      setIsPageLoading(false);
      
      // 2. Trigger Panels Slide-in immediately after loader
      setTimeout(() => setShowPanels(true), 50);

      // 3. Trigger Content Fade-in after panels are largely in place
      setTimeout(() => setShowContent(true), 800);
    }, 1500);

    return () => clearTimeout(loaderTimer);
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // 1. Save user data (including role) to local storage
        localStorage.setItem('user', JSON.stringify(data));

        toast.success(`Welcome back, ${data.name}!`, {
            duration: 3000,
            icon: '👋',
        });

        // 2. CHECK ROLE AND REDIRECT ACCORDINGLY
        setTimeout(() => {
          if (data.role === 'employee') {
            console.log('Redirecting to Employee Dashboard...');
            navigate('/employee_home_page'); // Navigate to Employee Page
          } else {
            console.log('Redirecting to User Homepage...');
            navigate('/userpage');      // Navigate to Standard User Page
          }
        }, 1000);

      } else {
        toast.error(data.message || 'Login failed');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      toast.error('Server error. Is the backend running?');
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // LOADING SCREEN
  // ---------------------------------------------------------
  if (isPageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 z-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-blue-50 p-4 rounded-full animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-blue-600">
              <path d="M21 21V3l-9 9-9-9v18" />
            </svg>
          </div>
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
    <div className="flex min-h-screen bg-gray-50 overflow-hidden relative">
      
      {/* LEFT SIDE - Branding Panel (Slides in from Left) */}
      <div 
        className={`hidden lg:flex lg:w-1/2 relative overflow-hidden bg-blue-600 justify-around items-center text-white z-10
        transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) transform
        ${showPanels ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 opacity-90"></div>
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-400 opacity-50 mix-blend-multiply blur-xl animate-pulse"></div>
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-blue-400 opacity-40 mix-blend-multiply blur-2xl"></div>

        {/* Content inside Left Panel (Fades in later) */}
        <div 
          className={`relative z-10 flex flex-col items-center text-center px-10 transition-all duration-700 delay-300 transform
          ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          <div className="bg-white/20 p-4 rounded-full mb-6 backdrop-blur-sm shadow-xl">
            <Rocket size={64} className="text-white drop-shadow-md" />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight mb-4 drop-shadow-sm">
            Welcome Back!
          </h2>
          <p className="text-blue-100 max-w-md text-lg drop-shadow-sm">
            Access your dashboard, manage bookings, and explore our exclusive offers.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form (Slides in from Right) */}
      <div 
        className={`flex w-full lg:w-1/2 justify-center items-center bg-white px-6 py-12 lg:px-12 z-10
        transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) transform
        ${showPanels ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
      >
        <div 
          className={`w-full max-w-md space-y-8 transition-all duration-700 delay-500 transform
          ${showContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        >
          <div className="text-left">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Sign In
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Welcome back! Please enter your details.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={onSubmit}>
            <div className="space-y-5">
              
              {/* Email */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 ease-in-out"
                    placeholder="john@example.com"
                    value={email}
                    onChange={onChange}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="group">
                <div className="flex justify-between items-center mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-500 font-medium">Forgot password?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 ease-in-out"
                    placeholder="••••••••"
                    value={password}
                    onChange={onChange}
                  />
                </div>
              </div>

            </div>

            <div className="flex flex-col gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                 {isSubmitting ? 'Signing In...' : 'Sign In'}
                 {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              </button>
              
              <div className="text-center mt-4">
                <span className="text-gray-500 text-sm">Don't have an account? </span>
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 text-sm">
                  Register here
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;