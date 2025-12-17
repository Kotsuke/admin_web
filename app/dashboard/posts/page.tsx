'use client';

// --- 1. IMPORT LIBRARY ---
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, MapPin, Search, ExternalLink, Calendar, RefreshCcw } from 'lucide-react'; 
import Swal from 'sweetalert2';

// --- 2. FUNGSI UTAMA HALAMAN ---
export default function ManagePostsPage() {
  
  // === STATE (PENAMPUNG DATA) ===
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Filter
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // === FUNGSI: AMBIL DATA (DENGAN HEADER NGROK) ===
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      // 👇 PERBAIKAN: Tambah headers ini biar tembus Ngrok
      const res = await axios.get(`${apiUrl}/posts`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json"
        }
      });
      
      console.log("DATA API DITERIMA:", res.data);

      if (Array.isArray(res.data)) {
        setPosts(res.data);
      } else {
        console.error("Format Data Salah! Harusnya Array [], tapi dapat:", res.data);
        setPosts([]); 
      }
      
    } catch (error) {
      console.error("Gagal ambil data:", error);
      setPosts([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // === FUNGSI: HAPUS DATA (DENGAN HEADER NGROK) ===
  const handleDelete = async (postId: number) => {
    const result = await Swal.fire({
      title: 'Hapus Laporan?',
      text: "Data yang dihapus tidak bisa dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (result.isConfirmed) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        
        // 👇 PERBAIKAN: Tambah headers di sini juga
        await axios.delete(`${apiUrl}/posts/${postId}`, {
            headers: {
              "ngrok-skip-browser-warning": "true"
            }
        });
        
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
        Swal.fire('Terhapus!', 'Laporan telah dihapus.', 'success');
      } catch (error) {
        Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus.', 'error');
      }
    }
  };

  // === FUNGSI: RESET FILTER ===
  const resetFilter = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
  };

  // === LOGIC FILTER ===
  const safePosts = Array.isArray(posts) ? posts : [];

  const filteredPosts = safePosts.filter((post) => {
    const matchesSearch =
      (post.caption || '').toLowerCase().includes(search.toLowerCase()) ||
      (post.uploaded_by || '').toLowerCase().includes(search.toLowerCase());

    let matchesDate = true;
    const postDate = new Date(post.date); 

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (postDate < start) matchesDate = false;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (postDate > end) matchesDate = false;
    }

    return matchesSearch && matchesDate;
  });

  // === TAMPILAN LOADING ===
  if (loading && safePosts.length === 0) {
    return <div className="p-8 text-center text-gray-500">Loading Data...</div>;
  }

  // === TAMPILAN UTAMA (JSX) ===
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Laporan Masuk</h1>
        
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-lg shadow-sm border">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari..."
              value={search}
              className="pl-9 pr-4 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 text-black w-32 md:w-48"
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-2.5 top-2.5 text-gray-400" size={16} />
          </div>

          <div className="h-6 w-px bg-gray-300 mx-1 hidden md:block"></div>

          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-md px-2 py-2 text-sm text-black focus:ring-blue-500"
          />
          <span className="text-gray-400">-</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-md px-2 py-2 text-sm text-black focus:ring-blue-500"
          />

          {(search || startDate || endDate) && (
            <button 
              onClick={resetFilter}
              className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="Reset Filter"
            >
              <RefreshCcw size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-900 uppercase text-xs font-bold">
            <tr>
              <th className="px-6 py-4">Foto</th>
              <th className="px-6 py-4">Pelapor</th>
              <th className="px-6 py-4">Detail</th>
              <th className="px-6 py-4">Lokasi</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredPosts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="w-16 h-16 relative rounded-lg overflow-hidden border bg-gray-200 group">
                    <img 
                      src={post.image_url} 
                      alt="Bukti" 
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
                    />
                    <a 
                        href={post.image_url} 
                        target="_blank" 
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                    >
                        <ExternalLink size={16} />
                    </a>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-900">{post.uploaded_by}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <Calendar size={12} />
                    {post.date}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                      post.severity === 'SERIUS' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                  }`}>
                      {post.severity}
                  </span>
                  <p className="text-gray-600 mt-1 line-clamp-1">{post.caption}</p>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin size={16} className="text-red-500" />
                    <span>{Number(post.lat).toFixed(4)}, {Number(post.long).toFixed(4)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => handleDelete(post.id)}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredPosts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                     <p className="font-medium">Tidak ada data ditemukan.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}