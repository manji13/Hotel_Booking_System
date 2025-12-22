import { useState, useEffect } from 'react';
import { Trash2, Edit2, X, Check, Users, ShieldAlert, Briefcase, User as UserIcon, Search, AlertTriangle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import EmployeeNavBar from '../../Header/EmployeeNav';

// Define User Interface
interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'employee';
}

const UserDetails = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- STATE MANAGEMENT ---
  const [searchTerm, setSearchTerm] = useState('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [newRole, setNewRole] = useState<'user' | 'employee'>('user');

  // Delete Modal State
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Fetch Users on Mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users');
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      toast.error('Server error');
    } finally {
      setIsLoading(false);
    }
  };

  // --- ACTIONS ---

  // 1. Trigger Delete Modal
  const initiateDelete = (id: string) => {
    setDeleteUserId(id);
  };

  // 2. Confirm Delete Action
  const confirmDelete = async () => {
    if (!deleteUserId) return;

    try {
      const response = await fetch(`http://localhost:5000/api/users/${deleteUserId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter((user) => user._id !== deleteUserId));
        toast.success('User deleted successfully', { icon: '🗑️' });
        setDeleteUserId(null); // Close modal
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      toast.error('Error deleting user');
    }
  };

  // 3. Open Edit Modal
  const openEditModal = (user: UserData) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsEditModalOpen(true);
  };

  // 4. Update User Role
  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`http://localhost:5000/api/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      const updatedUser = await response.json();

      if (response.ok) {
        setUsers(users.map((u) => (u._id === updatedUser._id ? { ...u, role: updatedUser.role } : u)));
        toast.success(`Role updated to ${newRole}`, { icon: '✅' });
        setIsEditModalOpen(false);
      } else {
        toast.error('Failed to update role');
      }
    } catch (error) {
      toast.error('Error updating role');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <EmployeeNavBar />
      
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: { background: '#363636', color: '#fff', borderRadius: '12px', fontSize: '14px' },
          success: { style: { background: '#fff', color: '#15803d', border: '1px solid #dcfce7' } },
          error: { style: { background: '#fff', color: '#b91c1c', border: '1px solid #fee2e2' } },
        }}
      />
      
      <main className="p-6 sm:p-10 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="text-blue-600 w-6 h-6" />
                User Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">View registered users, manage roles, and maintain security.</p>
            </div>
            
            {/* Search Bar */}
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-64 transition-all shadow-sm"
                />
              </div>
              <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 shadow-sm whitespace-nowrap">
                {filteredUsers.length} Users
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User Profile</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Email</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-9 w-9 flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{user.name}</div>
                              <div className="text-xs text-gray-400 font-mono">ID: {user._id.slice(-6)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize border shadow-sm
                            ${user.role === 'employee' 
                              ? 'bg-purple-50 text-purple-700 border-purple-100 ring-1 ring-purple-500/10' 
                              : 'bg-green-50 text-green-700 border-green-100 ring-1 ring-green-500/10'
                            }`}>
                            {user.role === 'employee' ? <Briefcase className="w-3 h-3 mr-1.5"/> : <UserIcon className="w-3 h-3 mr-1.5"/>}
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer hover:shadow-sm transform active:scale-95"
                              title="Edit Role"
                            >
                              <Edit2 size={16} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => initiateDelete(user._id)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer hover:shadow-sm transform active:scale-95"
                              title="Delete User"
                            >
                              <Trash2 size={16} strokeWidth={2.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">
                        No users match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </main>

      {/* --- EDIT ROLE MODAL --- */}
      <AnimatePresence>
        {isEditModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsEditModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0, transition: { type: "spring", damping: 20, stiffness: 300 }}}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-100"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <ShieldAlert className="text-blue-600 w-5 h-5" />
                      Edit Role
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Assign permission level for this user.</p>
                  </div>
                  <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{selectedUser.name}</p>
                      <p className="text-xs text-gray-500">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setNewRole('user')}
                      className={`relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-2 group transform active:scale-95 ${
                        newRole === 'user' ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-1 ring-blue-600 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <UserIcon size={20} className={newRole === 'user' ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                      <span className="text-xs font-bold uppercase tracking-wide">User</span>
                    </button>
                    <button
                      onClick={() => setNewRole('employee')}
                      className={`relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-2 group transform active:scale-95 ${
                        newRole === 'employee' ? 'border-purple-600 bg-purple-50/50 text-purple-700 ring-1 ring-purple-600 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <Briefcase size={20} className={newRole === 'employee' ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'} />
                      <span className="text-xs font-bold uppercase tracking-wide">Employee</span>
                    </button>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transform active:scale-95">Cancel</button>
                  <button onClick={handleUpdateRole} className="flex-1 py-2.5 px-4 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-700 hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer transform active:scale-95">
                    <Check size={16} strokeWidth={3} /> Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {deleteUserId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-red-900/20 backdrop-blur-sm"
              onClick={() => setDeleteUserId(null)}
            />

            {/* Delete Card */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 }}}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-red-100"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-100 animate-pulse">
                  <AlertTriangle size={32} strokeWidth={2.5} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete User?</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  Are you sure you want to permanently delete this user? This action cannot be undone.
                </p>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setDeleteUserId(null)}
                    className="flex-1 py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} />
                    Yes, Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default UserDetails;