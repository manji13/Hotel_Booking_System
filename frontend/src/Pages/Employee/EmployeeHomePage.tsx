import React, { useEffect, useState } from 'react';
import EmployeeNavBar from '../../Header/EmployeeNav';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Users, Briefcase, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const EmployeeHomePage = () => {
  const [data, setData] = useState([
    { name: 'Users', count: 0 },
    { name: 'Employees', count: 0 },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users');
        const users = await response.json();

        if (response.ok) {
          const userCount = users.filter((u: any) => u.role === 'user').length;
          const employeeCount = users.filter((u: any) => u.role === 'employee').length;

          setData([
            { name: 'Standard Users', count: userCount },
            { name: 'Employees', count: employeeCount },
          ]);
        } else {
          toast.error('Failed to load user stats');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  const COLORS = ['#3b82f6', '#10b981']; // Blue for users, Green for employees

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeNavBar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
          <p className="text-gray-500">Overview of the system's user distribution.</p>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Users</p>
              <h3 className="text-2xl font-bold">{data[0].count}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="bg-emerald-100 p-3 rounded-lg">
              <Briefcase className="text-emerald-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Staff Members</p>
              <h3 className="text-2xl font-bold">{data[1].count}</h3>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Activity size={20} className="text-blue-500" />
              Role Distribution
            </h2>
          </div>

          <div className="h-80 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={60}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeHomePage;