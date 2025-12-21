import React, { useEffect, useState } from 'react';
import EmployeeNavBar from '../../Header/EmployeeNav';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { Users, Briefcase, Activity, Calendar, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const EmployeeHomePage = () => {
  const [userStats, setUserStats] = useState([
    { name: 'Users', count: 0 },
    { name: 'Employees', count: 0 },
  ]);
  
  const [bookingData, setBookingData] = useState([]);
  const [chartView, setChartView] = useState('daily');
  const [loading, setLoading] = useState(true);

  // Fetch User Stats
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users');
        const users = await response.json();
        if (response.ok) {
          const userCount = users.filter((u: any) => u.role === 'user').length;
          const employeeCount = users.filter((u: any) => u.role === 'employee').length;
          setUserStats([{ name: 'Standard Users', count: userCount }, { name: 'Employees', count: employeeCount }]);
        }
      } catch (error) { console.error('Error fetching users:', error); }
    };
    fetchUserStats();
  }, []);

  // Fetch Booking Stats (Includes Deleted Bookings)
  useEffect(() => {
    const fetchBookingHistory = async () => {
      try {
        setLoading(true);
        // Correct URL based on your server.js structure
        const response = await fetch(`http://localhost:5000/api/payments/booking-stats?type=${chartView}`);
        
        if (response.ok) {
          const data = await response.json();
          setBookingData(data);
        } else {
          console.error("Failed to fetch stats");
        }
      } catch (error) {
        console.error('Error fetching booking stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingHistory();
  }, [chartView]);

  const COLORS = ['#3b82f6', '#10b981'];

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeNavBar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
          <p className="text-gray-500">Overview of system users and historical booking trends.</p>
        </div>

        {/* 1. STATS CARDS (Total Users & Staff) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg"><Users className="text-blue-600" size={24} /></div>
            <div><p className="text-sm text-gray-500 font-medium">Total Users</p><h3 className="text-2xl font-bold">{userStats[0].count}</h3></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="bg-emerald-100 p-3 rounded-lg"><Briefcase className="text-emerald-600" size={24} /></div>
            <div><p className="text-sm text-gray-500 font-medium">Staff Members</p><h3 className="text-2xl font-bold">{userStats[1].count}</h3></div>
          </div>
        </div>

        {/* 2. USER ROLE CHART (Moved Up) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Activity size={20} className="text-blue-500" />
              User Distribution
            </h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userStats} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={60}>
                  {userStats.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. BOOKING HISTORY CHART (Moved Down) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-500" />
              Booking History Trend
            </h2>
            <div className="flex bg-gray-100 p-1 rounded-lg self-start md:self-auto">
              <button onClick={() => setChartView('daily')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${chartView === 'daily' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Daily</button>
              <button onClick={() => setChartView('monthly')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${chartView === 'monthly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Monthly</button>
            </div>
          </div>

          <div className="h-80 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
            ) : bookingData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bookingData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ stroke: '#6366f1', strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="bookings" stroke="#6366f1" fillOpacity={1} fill="url(#colorBookings)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Calendar size={48} className="mb-2 opacity-50" />
                <p>No booking history available yet.</p>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center">
            * Chart includes Cancelled bookings to reflect historical interest.
          </p>
        </div>

      </main>
    </div>
  );
};

export default EmployeeHomePage;