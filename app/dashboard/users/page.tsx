'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Search, User, Shield, Mail } from 'lucide-react';
import Swal from 'sweetalert2';

export default function ManageUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // 1. Ambil Data User
  // ... (kode atas tetap sama) ...

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      // 👇 PERBAIKAN: Tambah Headers Ngrok
      const res = await axios.get(`${apiUrl}/users`, {
        headers: {
            "ngrok-skip-browser-warning": "true"
        }
      });
      
      if (Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Gagal ambil data user:", error);
    } finally {
      setLoading(false);
    }
  };

  // ... (sisa kode ke bawah tetap sama) ...

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Hapus User
  const handleDelete = async (userId: number, username: string) => {
    const result = await Swal.fire({
      title: `Hapus User ${username}?`,
      text: "Semua laporan & data user ini akan ikut terhapus!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus Permanen!'
    });

    if (result.isConfirmed) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        await axios.delete(`${apiUrl}/users/${userId}`);
        
        setUsers(users.filter((u) => u.id !== userId));
        Swal.fire('Terhapus!', 'User telah dihapus.', 'success');
      } catch (error: any) {
        Swal.fire('Gagal!', error.response?.data?.error || 'Terjadi kesalahan.', 'error');
      }
    }
  };

  // 3. Filter Search
  const filteredUsers = users.filter((user) => 
    user.full_name.toLowerCase().includes(search.toLowerCase()) ||
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center">Loading Users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Data Pengguna</h1>
        
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari nama/email..."
            value={search}
            className="pl-9 pr-4 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 text-black w-64"
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-2.5 top-2.5 text-gray-400" size={16} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-900 uppercase text-xs font-bold">
            <tr>
              <th className="px-6 py-4">Nama Lengkap</th>
              <th className="px-6 py-4">Akun</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                
                {/* Kolom Nama */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-900">{user.full_name}</span>
                  </div>
                </td>

                {/* Kolom Akun */}
                <td className="px-6 py-4 space-y-1">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User size={14} />
                    <span>{user.username}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <Mail size={14} />
                    <span>{user.email}</span>
                  </div>
                </td>

                {/* Kolom Role */}
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {user.role === 'admin' ? <Shield size={12}/> : <User size={12}/>}
                    {user.role.toUpperCase()}
                  </span>
                </td>

                {/* Kolom Aksi */}
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => handleDelete(user.id, user.username)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus User"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>

              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                  User tidak ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}