import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Image as ImageIcon, BedDouble, Users, DollarSign, Type, FileText, Check } from 'lucide-react';
import toast from 'react-hot-toast';
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
  const [description, setDescription] = useState('');
  // File State
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

    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('images', selectedFiles[i]);
    }

    try {
      const response = await fetch('http://localhost:5000/api/rooms', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Show Success Animation instead of immediate redirect
        setShowSuccess(true);
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/booking');
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

  // Animation Component
  const SuccessView = () => (
    <div className="flex flex-col items-center justify-center h-full py-20">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
      >
        <Check className="w-12 h-12 text-green-600" strokeWidth={3} />
      </motion.div>
      <motion.h3 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold text-gray-800"
      >
        Successfully Published!
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-500 mt-2"
      >
        Redirecting to listings...
      </motion.p>
    </div>
  );

  return (
    <div>
       <EmployeeNavBar />
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
     
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden min-h-[600px]">
        
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col justify-center"
            >
              <SuccessView />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-blue-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <PlusCircle /> Add New Room
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                
                {/* Room Type */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <label className="block text-sm font-bold text-blue-900 mb-1">Room Type</label>
                  <div className="relative">
                    <Type className="absolute left-3 top-3 text-blue-400" size={18} />
                    <select 
                      value={roomType} 
                      onChange={(e) => setRoomType(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2 rounded border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="">Select Type...</option>
                      <option value="Double Room (A/c)">Double Room (A/c)</option>
                      <option value="Triple room (non-A/c)">Triple room (non-A/c)</option>
                      <option value="Double Room(non - A/c)">Double Room(non - A/c)</option>
                      <option value="Cottage">Cottage</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Beds */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Beds</label>
                    <div className="relative">
                      <BedDouble className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input
                        type="number"
                        required
                        value={beds}
                        onChange={(e) => setBeds(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-2 rounded border border-gray-300 focus:border-blue-500 outline-none"
                        placeholder="2"
                      />
                    </div>
                  </div>

                  {/* Capacity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guest Capacity</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input
                        type="number"
                        required
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-2 rounded border border-gray-300 focus:border-blue-500 outline-none"
                        placeholder="4"
                      />
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Night ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-2 rounded border border-gray-300 focus:border-blue-500 outline-none"
                      placeholder="150"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                      <textarea 
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full pl-10 p-3 rounded border border-gray-300 focus:border-blue-500 outline-none"
                          rows={3}
                          placeholder="Room details..."
                      />
                    </div>
                </div>

                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex flex-col items-center cursor-pointer">
                    <ImageIcon size={32} className="text-gray-400 mb-2" />
                    <span className="text-blue-600 font-semibold">Upload Room Images</span>
                    <span className="text-xs text-gray-500 mt-1">Select 1 to 4 images (JPG, PNG)</span>
                    
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  
                  {/* Show selected file count */}
                  {selectedFiles && (
                    <div className="mt-2 text-sm text-green-600 font-medium">
                      {selectedFiles.length} file(s) selected
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg"
                >
                  {loading ? 'Uploading & Adding...' : 'Publish Room'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
     </div>
  );
};

export default AddBooking;