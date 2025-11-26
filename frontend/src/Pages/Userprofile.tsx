import { useState, useEffect } from 'react';
import { User, Mail, Save, Camera, Edit2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import UserProfileNavbar from '../Header/UserprofileNav';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- NEW: Page Loading State ---
  const [isPageLoading, setIsPageLoading] = useState(true);

  // 1. Handle Page Loading Animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1500); // Show loader for 1.5 seconds
    return () => clearTimeout(timer);
  }, []);

  // 2. Load user data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setName(parsedUser.name);
      setEmail(parsedUser.email);
    } else {
      // If no user found, redirect to login
      navigate('/login');
    }
  }, [navigate]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/users/profile/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        setIsEditing(false);
        toast.success('Profile updated successfully!', {
            icon: '✅',
            duration: 4000
        });
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (error) {
      toast.error('Server connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
      setIsEditing(false);
      setName(user?.name || '');
      setEmail(user?.email || '');
  };

  // --- 3. Render Loading Screen ---
  if (isPageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 z-50">
        <div className="flex flex-col items-center space-y-4">
          {/* Pulsing Icon */}
          <div className="bg-blue-50 p-4 rounded-full animate-pulse">
            <User className="h-10 w-10 text-blue-600" />
          </div>
          {/* Bouncing Dots Animation */}
          <div className="flex space-x-2">
            <div className="h-3 w-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-3 w-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-3 w-3 bg-blue-600 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  // Prevent flicker if user data isn't loaded yet (though loader usually covers this)
  if (!user) return null;

  // --- Main Content (Added fade-in animation class) ---
  return (
    <div className="min-h-screen bg-gray-50 animate-in fade-in duration-700">
      <UserProfileNavbar /> 

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 h-32 relative">
              <div className="absolute -bottom-16 left-8">
                <div className="relative">
                  {/* Profile Avatar Circle */}
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center text-5xl font-bold text-blue-600 overflow-hidden">
                    <div className="bg-blue-50 w-full h-full flex items-center justify-center">
                       {name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  {isEditing && (
                    <div className="absolute bottom-1 right-1 bg-gray-800 text-white p-2 rounded-full shadow-lg border-2 border-white">
                      <Camera size={16} />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="pt-20 pb-8 px-8 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500 font-medium capitalize">{user.role}</p>
              </div>
              
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  <Edit2 size={18} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <User className="text-blue-500" />
                  Account Details
                </h2>
                {isEditing && (
                    <span className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full animate-pulse">
                        Editing Mode
                    </span>
                )}
              </div>

              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 outline-none transition-all
                          ${isEditing 
                            ? 'border-gray-200 focus:border-blue-500 bg-white shadow-sm' 
                            : 'border-transparent bg-gray-50 text-gray-500 cursor-not-allowed'}`}
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 text-gray-400 h-5 w-5" />
                      <input
                        type="email"
                        disabled={!isEditing}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 outline-none transition-all
                          ${isEditing 
                            ? 'border-gray-200 focus:border-blue-500 bg-white shadow-sm' 
                            : 'border-transparent bg-gray-50 text-gray-500 cursor-not-allowed'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center gap-2"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center gap-2 px-8 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg hover:shadow-green-600/30 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Saving...' : (
                        <>
                          <Save size={18} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;