'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, AlertTriangle, FileCheck, Star, TrendingUp, Clock, Wrench, CheckCircle } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

type GrowthData = {
  users: string[]; // timestamps
  posts: string[]; // timestamps
};

export default function DashboardHome() {
  const [stats, setStats] = useState<any>(null);
  const [growthData, setGrowthData] = useState<GrowthData | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('monthly');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const headers = { "ngrok-skip-browser-warning": "true" };

        const [statsRes, growthRes] = await Promise.all([
          axios.get(`${apiUrl}/dashboard/stats`, { headers }),
          axios.get(`${apiUrl}/dashboard/growth`, { headers })
        ]);

        setStats(statsRes.data);
        setGrowthData(growthRes.data);
      } catch (error) {
        console.error("Gagal ambil data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Process data for chart when growthData or filter changes
  useEffect(() => {
    if (!growthData) return;

    const processData = () => {
      const { users, posts } = growthData;
      const grouped: { [key: string]: { users: number; posts: number } } = {};

      const addToGroup = (dateStr: string, type: 'users' | 'posts') => {
        const date = new Date(dateStr);
        let key = '';

        if (timeFilter === 'daily') {
          key = date.toISOString().split('T')[0]; // YYYY-MM-DD
        } else if (timeFilter === 'weekly') {
          // Get start of week (Sunday)
          const d = new Date(date);
          const day = d.getDay();
          const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
          // Simple week key: YYYY-Www
          // Let's use start of week date for label
          d.setDate(d.getDate() - d.getDay());
          key = d.toISOString().split('T')[0];
        } else if (timeFilter === 'monthly') {
          key = date.toISOString().slice(0, 7); // YYYY-MM
        } else { // ALL - group by month
          key = date.toISOString().slice(0, 7);
        }

        if (!grouped[key]) grouped[key] = { users: 0, posts: 0 };
        grouped[key][type]++;
      };

      users.forEach(d => addToGroup(d, 'users'));
      posts.forEach(d => addToGroup(d, 'posts'));

      // Convert to array and sort
      let data = Object.keys(grouped).map(key => ({
        name: key,
        users: grouped[key].users,
        posts: grouped[key].posts
      }));

      data.sort((a, b) => a.name.localeCompare(b.name));

      // Filter based on time range (rudimentary)
      const now = new Date();
      if (timeFilter === 'daily') {
        // Last 30 days
        data = data.slice(-30);
      } else if (timeFilter === 'weekly') {
        // Last 12 weeks
        data = data.slice(-12);
      } else if (timeFilter === 'monthly') {
        // Last 12 months
        data = data.slice(-12);
      }
      // 'all' passes everything

      // Accumulate totals for "Total Growth" if desired, OR show increment per period.
      // Request says "grafik peningkatan jumlah", usually implies Cumulative OR Rate.
      // Usually "Incresase" graph means delta per day. "Growth" often implies cumulative.
      // Let's stick to Delta (New users/posts per period) as it's more common for "Daily/Weekly" charts.

      setChartData(data);
    };

    processData();
  }, [growthData, timeFilter]);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Posts */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
            <FileCheck size={28} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Laporan</p>
            <h3 className="text-2xl font-bold text-black">{stats?.total_posts || 0}</h3>
          </div>
        </div>

        {/* Card 2: Serious Damage */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-red-100 text-red-600 rounded-full">
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Kerusakan Serius</p>
            <h3 className="text-2xl font-bold text-black">{stats?.serious_damage || 0}</h3>
          </div>
        </div>

        {/* Card 3: Total Users */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-green-100 text-green-600 rounded-full">
            <Users size={28} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">User Terdaftar</p>
            <h3 className="text-2xl font-bold text-black">{stats?.total_users || 0}</h3>
          </div>
        </div>

        {/* Card 4: Average Review */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-yellow-100 text-yellow-600 rounded-full">
            <Star size={28} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Rata-rata Review</p>
            <h3 className="text-2xl font-bold text-black">{stats?.average_rating || 0} / 5.0</h3>
          </div>
        </div>
      </div>

      {/* Status Breakdown Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Status Penanganan Laporan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Menunggu */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-orange-50 border border-orange-200">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Menunggu</p>
              <p className="text-2xl font-bold text-orange-600">{stats?.status_breakdown?.menunggu || 0}</p>
            </div>
          </div>

          {/* Diproses */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <Wrench size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Sedang Diproses</p>
              <p className="text-2xl font-bold text-blue-600">{stats?.status_breakdown?.diproses || 0}</p>
            </div>
          </div>

          {/* Selesai */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Selesai</p>
              <p className="text-2xl font-bold text-green-600">{stats?.status_breakdown?.selesai || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Statistik Pertumbuhan</h2>
          </div>

          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            {(['daily', 'weekly', 'monthly', 'all'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${timeFilter === filter
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {filter === 'daily' && 'Harian'}
                {filter === 'weekly' && 'Mingguan'}
                {filter === 'monthly' && 'Bulanan'}
                {filter === 'all' && 'Semua'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => {
                  if (timeFilter === 'daily') return value.slice(5); // MM-DD
                  return value;
                }}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line
                type="monotone"
                dataKey="users"
                name="User Baru"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="posts"
                name="Postingan Baru"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: '#3b82f6' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sentiment Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Analisis Sentimen Ulasan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Positif', value: stats?.sentiment?.positive || 0 },
                    { name: 'Negatif', value: stats?.sentiment?.negative || 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell key="cell-pos" fill="#10b981" />
                  <Cell key="cell-neg" fill="#ef4444" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-green-50 border border-green-100">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm text-gray-600">Sentimen Positif</p>
                  <p className="text-2xl font-bold text-gray-800">{stats?.sentiment?.positive || 0} Review</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-red-50 border border-red-100">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div>
                  <p className="text-sm text-gray-600">Sentimen Negatif</p>
                  <p className="text-2xl font-bold text-gray-800">{stats?.sentiment?.negative || 0} Review</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}