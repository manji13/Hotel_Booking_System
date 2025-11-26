import { useState, useEffect } from 'react';
import { Edit, Trash2, X, Check, Image as ImageIcon, BedDouble, Users, DollarSign, FileText, Upload, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

type RoomType = {
  _id: string;
  roomType: string;
  images: string[];
  beds: number;
  capacity: number;
  price: number;
  description: string;
};

const DetailsBooking = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<RoomType[]>([]);
  
  // Edit States
  const [editingRoom, setEditingRoom] = useState<RoomType | null>(null);
  const [newImages, setNewImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Animation/Modal States
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user || user.role !== 'employee') navigate('/');
    else fetchRooms();
  }, [navigate]);

  const fetchRooms = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/rooms');
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      console.error(err);
    }
  };

  // --- DELETE LOGIC ---
  // 1. Trigger Confirmation
  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
  };

  // 2. Confirm Delete
  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/${deletingId}`, { method: 'DELETE' });
      if (res.ok) {
        // Update list immediately
        setRooms(rooms.filter(r => r._id !== deletingId));
        
        // Close confirmation & Show Success
        setDeletingId(null);
        setShowDeleteSuccess(true);
        
        // Auto hide success after 2s
        setTimeout(() => {
          setShowDeleteSuccess(false);
        }, 2000);
      } else {
        toast.error('Failed to delete');
      }
    } catch {
      toast.error('Server error');
    }
  };

  // --- UPDATE LOGIC ---
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('roomType', editingRoom.roomType);
    formData.append('beds', String(editingRoom.beds));
    formData.append('capacity', String(editingRoom.capacity));
    formData.append('price', String(editingRoom.price));
    formData.append('description', editingRoom.description);

    if (newImages) {
      Array.from(newImages).forEach(file => formData.append('images', file));
    }

    try {
      const res = await fetch(`http://localhost:5000/api/rooms/${editingRoom._id}`, {
        method: 'PUT',
        body: formData,
      });
      
      if (res.ok) {
        setShowUpdateSuccess(true);
        fetchRooms();
        setTimeout(() => {
          setShowUpdateSuccess(false);
          setEditingRoom(null);
          setNewImages(null);
        }, 2000);
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to update');
      }
    } catch {
      toast.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return '';
    const cleanPath = path.replace(/\\/g, '/');
    const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    return `http://localhost:5000${finalPath}`;
  };

  // --- Reusable Success Animation ---
  const SuccessView = ({ title }: { title: string }) => (
    <div className="flex flex-col items-center justify-center h-full py-10">
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
        className="text-2xl font-bold text-gray-800"
      >
        {title}
      </motion.h3>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Room Management</h1>
            <p className="text-gray-500 mt-2">View, edit, and manage all your property listings.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium text-gray-600">
            Total Rooms: {rooms.length}
          </div>
        </div>

        {/* ROOMS TABLE */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Preview</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Room Details</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Capacity</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rooms.map(room => (
                  <tr key={room._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="p-4 w-32">
                      <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                        {room.images[0] ? (
                          <img src={getImageUrl(room.images[0])} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400"><ImageIcon size={20} /></div>
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      <h3 className="font-bold text-gray-800 text-lg">{room.roomType}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><BedDouble size={14} /> {room.beds} Beds</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        <Users size={12} /> {room.capacity} Guests
                      </span>
                    </td>
                    <td className="p-6">
                      <span className="font-bold text-gray-900 text-lg">${room.price}</span>
                      <span className="text-gray-400 text-sm">/night</span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setEditingRoom(room)} 
                          className="p-2 bg-white border border-gray-200 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(room._id)} 
                          className="p-2 bg-white border border-gray-200 text-red-500 rounded-lg hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rooms.length === 0 && (
            <div className="p-12 text-center text-gray-400">No rooms found. Start by adding one!</div>
          )}
        </div>

        {/* DELETE CONFIRMATION MODAL */}
        <AnimatePresence>
          {deletingId && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setDeletingId(null)}
              />
              {/* Modal */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full relative z-10 text-center"
              >
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Are you sure?</h3>
                <p className="text-gray-500 mb-6">Do you really want to delete this room? This process cannot be undone.</p>
                <div className="flex gap-3 justify-center">
                  <button 
                    onClick={() => setDeletingId(null)} 
                    className="px-5 py-2.5 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete} 
                    className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all active:scale-95"
                  >
                    Delete Room
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* DELETE SUCCESS MODAL */}
        <AnimatePresence>
          {showDeleteSuccess && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl p-10 max-w-sm w-full relative z-10"
              >
                <SuccessView title="Successfully Deleted" />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* EDIT MODAL */}
        <AnimatePresence>
          {editingRoom && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => !showUpdateSuccess && setEditingRoom(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />

              {/* Modal Content */}
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10"
              >
                
                <AnimatePresence mode="wait">
                  {showUpdateSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="p-12"
                    >
                      <SuccessView title="Successfully Updated!" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                      {/* Modal Header */}
                      <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-20 backdrop-blur-sm">
                        <div>
                          <h2 className="text-xl font-bold text-gray-800">Edit Room Details</h2>
                          <p className="text-sm text-gray-500">Update information for {editingRoom.roomType}</p>
                        </div>
                        <button 
                          onClick={() => { setEditingRoom(null); setNewImages(null); }}
                          className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      {/* Edit Form */}
                      <form onSubmit={handleUpdate} className="p-8 space-y-6">
                        {/* (Form Content Same as Previous Version) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Room Type</label>
                            <div className="relative">
                              <div className="absolute left-3 top-3 text-gray-400 pointer-events-none"><BedDouble size={18}/></div>
                              <select 
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all appearance-none"
                                value={editingRoom.roomType}
                                onChange={e => setEditingRoom({ ...editingRoom, roomType: e.target.value })}
                              >
                                <option value="Deluxe">Deluxe Room</option>
                                <option value="Standard">Standard Room</option>
                                <option value="Suite">Family Suite</option>
                                <option value="Economy">Economy</option>
                              </select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Price ($)</label>
                            <div className="relative">
                              <div className="absolute left-3 top-3 text-gray-400 pointer-events-none"><DollarSign size={18}/></div>
                              <input 
                                type="number" 
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                value={editingRoom.price}
                                onChange={e => setEditingRoom({ ...editingRoom, price: Number(e.target.value) })}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Number of Beds</label>
                            <input 
                              type="number" 
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                              value={editingRoom.beds}
                              onChange={e => setEditingRoom({ ...editingRoom, beds: Number(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Guest Capacity</label>
                            <input 
                              type="number" 
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                              value={editingRoom.capacity}
                              onChange={e => setEditingRoom({ ...editingRoom, capacity: Number(e.target.value) })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Description</label>
                          <div className="relative">
                            <div className="absolute left-3 top-3 text-gray-400 pointer-events-none"><FileText size={18}/></div>
                            <textarea 
                              rows={3}
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none"
                              value={editingRoom.description}
                              onChange={e => setEditingRoom({ ...editingRoom, description: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Update Images</label>
                          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer group relative">
                            <input 
                              type="file" 
                              multiple 
                              accept="image/*" 
                              onChange={e => setNewImages(e.target.files)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="p-3 bg-blue-50 rounded-full mb-3 group-hover:scale-110 transition-transform">
                              <Upload className="text-blue-500 w-6 h-6" />
                            </div>
                            <p className="text-sm text-gray-600 font-medium">
                              {newImages ? `${newImages.length} files selected` : 'Click to replace existing images'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG</p>
                          </div>
                          
                          {!newImages && (
                            <div className="flex gap-2 mt-3 overflow-x-auto py-2">
                              {editingRoom.images.map((img, idx) => (
                                <div key={idx} className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                                  <img src={getImageUrl(img)} className="w-full h-full object-cover" alt="preview" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                          <button 
                            type="button"
                            onClick={() => { setEditingRoom(null); setNewImages(null); }}
                            className="px-5 py-2.5 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            disabled={loading}
                            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-70 disabled:scale-100"
                          >
                            {loading ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
                
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default DetailsBooking;