import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Image as ImageIcon, BedDouble, Users, DollarSign, Type, FileText, Check, Layers, Upload } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import EmployeeNavBar from '../../Header/EmployeeNav';

const AddBooking = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form State
  const [roomType, setRoomType] = useState('');
  const [beds, setBeds] = useState<number | ''>('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>('');
  const [availableCount, setAvailableCount] = useState<number | ''>(''); 
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user || user.role !== 'employee') {
      toast.error('Access Denied: Staff Only');
      navigate('/');
    }
  }, [navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    if (e.target.files.length > 4) {
      toast.error('You can only select up to 4 images');
      e.target.value = '';
      setSelectedFiles(null);
    } else {
      setSelectedFiles(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('roomType', roomType);
    formData.append('beds', String(beds));
    formData.append('capacity', String(capacity));
    formData.append('price', String(price));
    formData.append('description', description);
    formData.append('availableCount', String(availableCount || 1)); 

    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('images', selectedFiles[i]);
    }

    try {
      const response = await fetch('http://localhost:5000/api/rooms', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/booking'); // Navigate to booking list
        }, 2000);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to add room');
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error('Server error');
      setLoading(false);
    }
  };

  const SuccessView = () => (
    <div className="flex flex-col items-center justify-center h-full py-20">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
      >
        <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
      </motion.div>
      <motion.h3 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-gray-800"
      >
        Successfully Published!
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-gray-500 mt-2"
      >
        Redirecting to listings...
      </motion.p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <EmployeeNavBar />
      
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { background: '#363636', color: '#fff', borderRadius: '12px', fontSize: '13px' },
          success: { style: { background: '#fff', color: '#15803d', border: '1px solid #dcfce7' } },
          error: { style: { background: '#fff', color: '#b91c1c', border: '1px solid #fee2e2' } },
        }}
      />

      <main className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-3xl mx-auto"
        >
          
          {/* Header - Reduced Size */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <PlusCircle className="text-blue-600 w-6 h-6" />
              Add New Room
            </h1>
            <p className="text-sm text-gray-500 mt-1 ml-8">Create a new listing for your hotel inventory.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <AnimatePresence mode="wait">
              {showSuccess ? (
                <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col justify-center min-h-[500px]">
                  <SuccessView />
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  
                  <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    
                    {/* Room Type */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Room Type</label>
                      <div className="relative group">
                        <Type className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <select 
                          value={roomType} 
                          onChange={(e) => setRoomType(e.target.value)} 
                          required 
                          className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all appearance-none text-sm text-gray-700 font-medium cursor-pointer hover:bg-gray-100"
                        >
                          <option value="">Select Room Category...</option>
                          <option value="Double Room (A/c)">Double Room (A/c)</option>
                          <option value="Triple room (non-A/c)">Triple room (non-A/c)</option>
                          <option value="Double Room(non - A/c)">Double Room (non - A/c)</option>
                          <option value="Cottage">Cottage</option>
                        </select>
                        <div className="absolute right-4 top-3.5 pointer-events-none border-t-4 border-l-4 border-transparent border-t-gray-500"></div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Bed Count</label>
                        <div className="relative group">
                          <BedDouble className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                          <input 
                            type="number" 
                            required 
                            value={beds} 
                            onChange={(e) => setBeds(e.target.value === '' ? '' : Number(e.target.value))} 
                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm cursor-pointer hover:bg-gray-100 placeholder:text-gray-400" 
                            placeholder="e.g. 2" 
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Guest Capacity</label>
                        <div className="relative group">
                          <Users className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                          <input 
                            type="number" 
                            required 
                            value={capacity} 
                            onChange={(e) => setCapacity(e.target.value === '' ? '' : Number(e.target.value))} 
                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm cursor-pointer hover:bg-gray-100 placeholder:text-gray-400" 
                            placeholder="e.g. 4" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Price & Stock - Highlighted Box */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-blue-50/40 p-5 rounded-xl border border-blue-100/50">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Price ($)</label>
                            <div className="relative group">
                              <DollarSign className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                              <input 
                                type="number" 
                                required 
                                value={price} 
                                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} 
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm cursor-pointer" 
                                placeholder="150" 
                              />
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-blue-600 uppercase tracking-wider ml-1">Stock Quantity</label>
                            <div className="relative group">
                              <Layers className="absolute left-3 top-3 text-blue-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                              <input 
                                  type="number" 
                                  required 
                                  min="1" 
                                  value={availableCount} 
                                  onChange={(e) => setAvailableCount(e.target.value === '' ? '' : Number(e.target.value))} 
                                  className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-blue-900 font-bold transition-all text-sm cursor-pointer" 
                                  placeholder="Total Available" 
                              />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Description</label>
                      <div className="relative group">
                        <FileText className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <textarea 
                          value={description} 
                          onChange={(e) => setDescription(e.target.value)} 
                          className="w-full pl-9 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none resize-none transition-all text-sm cursor-pointer hover:bg-gray-100" 
                          rows={3} 
                          placeholder="Describe the room amenities, view, and features..." 
                        />
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Room Gallery</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 hover:border-blue-400 transition-all cursor-pointer group relative">
                        <div className="flex flex-col items-center justify-center pointer-events-none">
                          <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <Upload size={20} />
                          </div>
                          <span className="text-blue-600 font-bold text-xs group-hover:underline">Click to upload images</span>
                          <span className="text-[10px] text-gray-400 mt-1">Supports JPG, PNG (Max 4 images)</span>
                        </div>
                        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      </div>
                      
                      {selectedFiles && (
                        <div className="flex items-center gap-2 text-xs text-green-600 font-semibold bg-green-50 p-2 rounded-lg border border-green-100 animate-in fade-in slide-in-from-top-2">
                          <Check size={14} /> {selectedFiles.length} image(s) selected ready for upload.
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Publishing...
                          </>
                        ) : (
                          'Publish Listing'
                        )}
                      </button>
                    </div>

                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AddBooking;