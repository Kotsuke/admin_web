'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, AlertTriangle, FileCheck } from 'lucide-react';

export default function DashboardHome() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        // 👇 PERBAIKAN: Tambah Headers Ngrok disini
        const res = await axios.get(`${apiUrl}/dashboard/stats`, {
            headers: {
                "ngrok-skip-browser-warning": "true"
            }
        });
        setStats(res.data);
      } catch (error) {
        console.error("Gagal ambil statistik:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
            <FileCheck size={32} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Laporan</p>
            <h3 className="text-2xl font-bold text-black">{stats?.total_posts || 0}</h3>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-red-100 text-red-600 rounded-full">
            <AlertTriangle size={32} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Kerusakan Serius</p>
            <h3 className="text-2xl font-bold text-black">{stats?.serious_damage || 0}</h3>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-green-100 text-green-600 rounded-full">
            <Users size={32} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">User Terdaftar</p>
            <h3 className="text-2xl font-bold text-black">{stats?.total_users || 0}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}