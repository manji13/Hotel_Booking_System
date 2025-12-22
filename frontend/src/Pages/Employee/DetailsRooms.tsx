import { useState, useEffect } from 'react';
import { Edit, Trash2, X, Check, Image as ImageIcon, BedDouble, Users, DollarSign, FileText, Upload, AlertTriangle, Search, Layers } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import EmployeeNavBar from '../../Header/EmployeeNav';

type RoomType = {
  _id: string;
  roomType: string;
  images: string[];
  beds: number;
  capacity: number;
  price: number;
  description: string;
  availableCount: number;
};

const DetailsBooking = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  
  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Edit States
  const [editingRoom, setEditingRoom] = useState<RoomType | null>(null);
  const [newImages, setNewImages] = useState<FileList | null>(null);
  
  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      toast.error('Failed to load rooms');
    } finally {
      setIsLoadingPage(false);
    }
  };

  // --- DELETE LOGIC ---
  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/${deletingId}`, { method: 'DELETE' });
      if (res.ok) {
        setRooms(rooms.filter(r => r._id !== deletingId));
        setDeletingId(null);
        toast.success('Room deleted successfully', { icon: '🗑️' });
      } else {
        toast.error('Failed to delete room');
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
    formData.append('availableCount', String(editingRoom.availableCount));

    if (newImages) {
      Array.from(newImages).forEach(file => formData.append('images', file));
    }

    try {
      const res = await fetch(`http://localhost:5000/api/rooms/${editingRoom._id}`, {
        method: 'PUT',
        body: formData,
      });
      
      if (res.ok) {
        toast.success('Room updated successfully', { icon: '✅' });
        fetchRooms();
        setEditingRoom(null);
        setNewImages(null);
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

  // Filter Logic
  const filteredRooms = rooms.filter(room => 
    room.roomType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoadingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <EmployeeNavBar />
      
      {/* Toast Config */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { background: '#363636', color: '#fff', borderRadius: '12px', fontSize: '14px' },
          success: { style: { background: '#fff', color: '#15803d', border: '1px solid #dcfce7' } },
          error: { style: { background: '#fff', color: '#b91c1c', border: '1px solid #fee2e2' } },
        }}
      />

      <main className="p-6 sm:p-10 max-w-7xl mx-auto">
        
        {/* Page Entry Animation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Layers className="text-blue-600 w-6 h-6" />
                Room Inventory
              </h1>
              <p className="text-sm text-gray-500 mt-1">Manage pricing, availability, and room details.</p>
            </div>
            
            {/* Search & Count */}
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search rooms..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-64 transition-all shadow-sm"
                />
              </div>
              <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 shadow-sm whitespace-nowrap">
                {filteredRooms.length} Rooms
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Preview</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Room Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRooms.length > 0 ? (
                    filteredRooms.map(room => (
                      <tr key={room._id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-4 w-32">
                          <div className="w-20 h-16 rounded-lg overflow-hidden shadow-sm border border-gray-100 bg-gray-100 flex items-center justify-center">
                            {room.images[0] ? (
                              <img src={getImageUrl(room.images[0])} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={20} className="text-gray-400" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{room.roomType}</h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><BedDouble size={12} /> {room.beds} Beds</span>
                            <span className="flex items-center gap-1"><Users size={12} /> {room.capacity} Guests</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold shadow-sm border
                            ${room.availableCount === 0 
                              ? 'bg-red-50 text-red-700 border-red-100' 
                              : 'bg-green-50 text-green-700 border-green-100'
                            }`}>
                            {room.availableCount === 0 ? 'SOLD OUT' : `${room.availableCount} Available`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-900">${room.price}</span>
                          <span className="text-xs text-gray-500"> / night</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => setEditingRoom(room)} 
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer hover:shadow-sm transform active:scale-95"
                              title="Edit Room"
                            >
                              <Edit size={16} strokeWidth={2.5} />
                            </button>
                            <button 
                              onClick={() => setDeletingId(room._id)} 
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer hover:shadow-sm transform active:scale-95"
                              title="Delete Room"
                            >
                              <Trash2 size={16} strokeWidth={2.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                        No rooms match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </main>

      {/* --- DELETE MODAL --- */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeletingId(null)} />
            <motion.div 
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 }}}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-red-100"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-100 animate-pulse">
                  <AlertTriangle size={32} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Room?</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">Permanently remove this room listing? This cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeletingId(null)} className="flex-1 py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl transition-colors cursor-pointer">Cancel</button>
                  <button onClick={confirmDelete} className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2">
                    <Trash2 size={18} /> Yes, Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- EDIT MODAL --- */}
      <AnimatePresence>
        {editingRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingRoom(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 }}}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 sticky top-0 z-20 backdrop-blur-md">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Edit size={18} className="text-blue-600"/> Edit Room</h2>
                  <p className="text-xs text-gray-500">Update details for {editingRoom.roomType}</p>
                </div>
                <button onClick={() => { setEditingRoom(null); setNewImages(null); }} className="p-2 hover:bg-gray-200/50 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleUpdate} className="p-8 space-y-6">
                
                {/* Top Grid: Type & Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Room Type</label>
                    <div className="relative">
                      <div className="absolute left-3 top-3 text-gray-400 pointer-events-none"><BedDouble size={18}/></div>
                      <select className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" value={editingRoom.roomType} onChange={e => setEditingRoom({ ...editingRoom, roomType: e.target.value })}>
                        <option value="Deluxe">Deluxe Room</option>
                        <option value="Standard">Standard Room</option>
                        <option value="Suite">Family Suite</option>
                        <option value="Economy">Economy</option>
                        <option value="Cottage">Cottage</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Price ($)</label>
                    <div className="relative">
                      <div className="absolute left-3 top-3 text-gray-400 pointer-events-none"><DollarSign size={18}/></div>
                      <input type="number" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" value={editingRoom.price} onChange={e => setEditingRoom({ ...editingRoom, price: Number(e.target.value) })} />
                    </div>
                  </div>
                </div>

                {/* Middle Grid: Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Beds</label>
                    <input type="number" className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={editingRoom.beds} onChange={e => setEditingRoom({ ...editingRoom, beds: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Capacity</label>
                    <input type="number" className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={editingRoom.capacity} onChange={e => setEditingRoom({ ...editingRoom, capacity: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-blue-700">Stock Count</label>
                    <input type="number" min="0" className="w-full px-3 py-2 bg-white border-2 border-blue-300 rounded-lg text-sm font-bold text-blue-800 focus:ring-2 focus:ring-blue-500 outline-none" value={editingRoom.availableCount} onChange={e => setEditingRoom({ ...editingRoom, availableCount: Number(e.target.value) })} />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Description</label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400 pointer-events-none"><FileText size={18}/></div>
                    <textarea rows={3} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" value={editingRoom.description} onChange={e => setEditingRoom({ ...editingRoom, description: e.target.value })} />
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Gallery</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-gray-50 hover:border-blue-300 transition-all cursor-pointer group relative bg-gray-50/30">
                    <input type="file" multiple accept="image/*" onChange={e => setNewImages(e.target.files)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full mb-3 group-hover:scale-110 transition-transform"><Upload size={20} /></div>
                    <p className="text-sm text-gray-600 font-medium">{newImages ? <span className="text-blue-600 font-bold">{newImages.length} files selected</span> : 'Click to replace existing images'}</p>
                  </div>
                  
                  {/* Image Preview Strip */}
                  {!newImages && (
                    <div className="flex gap-3 overflow-x-auto py-3 pb-1">
                      {editingRoom.images.map((img, idx) => (
                        <div key={idx} className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 shadow-sm group">
                          <img src={getImageUrl(img)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="preview" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                  <button type="button" onClick={() => { setEditingRoom(null); setNewImages(null); }} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                  <button type="submit" disabled={loading} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/40 active:scale-95 transition-all flex items-center gap-2">
                    {loading ? 'Saving...' : <><Check size={16} strokeWidth={3} /> Save Changes</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DetailsBooking;