'use client';

// --- 1. IMPORT LIBRARY ---
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, MapPin, Search, ExternalLink, Calendar, RefreshCcw, Clock, Wrench, CheckCircle, Eye, X, AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';

// --- 2. FUNGSI UTAMA HALAMAN ---
export default function ManagePostsPage() {

  // === STATE (PENAMPUNG DATA) ===
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  // State Filter
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  // === FUNGSI: HAPUS DATA (DENGAN HEADER NGROK + TOKEN) ===
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

        // Ambil token dari cookies
        const adminData = Cookies.get('admin_token');
        const token = adminData ? JSON.parse(adminData).token : null;

        await axios.delete(`${apiUrl}/posts/${postId}`, {
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
          }
        });

        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
        Swal.fire('Terhapus!', 'Laporan telah dihapus.', 'success');
      } catch (error: any) {
        Swal.fire('Gagal!', error.response?.data?.error || 'Terjadi kesalahan saat menghapus.', 'error');
      }
    }
  };

  // === FUNGSI: RESET FILTER ===
  const resetFilter = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setStatusFilter('all');
  };

  // === FUNGSI: UPDATE STATUS ===
  const handleUpdateStatus = async (postId: number, newStatus: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const adminData = Cookies.get('admin_token');
      const token = adminData ? JSON.parse(adminData).token : null;

      await axios.put(`${apiUrl}/posts/${postId}/status`,
        { status: newStatus },
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      // Update local state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, status: newStatus } : post
        )
      );

      Swal.fire({
        icon: 'success',
        title: 'Status Diperbarui!',
        text: `Status berhasil diubah ke ${newStatus}`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error: any) {
      Swal.fire('Gagal!', error.response?.data?.error || 'Terjadi kesalahan saat update status.', 'error');
    }
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

    // Status filter
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      matchesStatus = (post.status || '').toUpperCase() === statusFilter.toUpperCase();
    }

    return matchesSearch && matchesDate && matchesStatus;
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

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm text-black focus:ring-blue-500 bg-white"
          >
            <option value="all">Semua Status</option>
            <option value="MENUNGGU">🕐 Menunggu</option>
            <option value="DIPROSES">🔧 Diproses</option>
            <option value="SELESAI">✅ Selesai</option>
          </select>

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

          {(search || startDate || endDate || statusFilter !== 'all') && (
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
              <th className="px-6 py-4">Status</th>
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
                  <span className={`px-2 py-1 rounded text-xs font-bold ${post.severity === 'SERIUS' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                    {post.severity}
                  </span>
                  <p className="text-gray-600 mt-1 line-clamp-1">{post.caption}</p>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={(post.status || 'MENUNGGU').toUpperCase()}
                    onChange={(e) => handleUpdateStatus(post.id, e.target.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border-0 cursor-pointer transition-colors ${(post.status || '').toUpperCase() === 'SELESAI'
                      ? 'bg-green-100 text-green-700'
                      : (post.status || '').toUpperCase() === 'DIPROSES'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-orange-100 text-orange-700'
                      }`}
                  >
                    <option value="MENUNGGU">🕐 Menunggu</option>
                    <option value="DIPROSES">🔧 Diproses</option>
                    <option value="SELESAI">✅ Selesai</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin size={16} className="text-red-500" />
                    <span>{Number(post.lat).toFixed(4)}, {Number(post.long).toFixed(4)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setSelectedPost(post)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                      title="Lihat Detail"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                      title="Hapus"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredPosts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="font-medium">Tidak ada data ditemukan.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* === MODAL DETAIL POST === */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-800">Detail Laporan</h2>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Image */}
              <div className="rounded-xl overflow-hidden border">
                <img
                  src={selectedPost.image_url}
                  alt="Bukti Foto"
                  className="w-full h-64 object-cover"
                  onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/600x300?text=Gambar+Tidak+Tersedia')}
                />
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pelapor */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Pelapor</p>
                  <p className="text-gray-800 font-medium">{selectedPost.uploaded_by}</p>
                </div>

                {/* Tanggal */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Tanggal Laporan</p>
                  <div className="flex items-center gap-2 text-gray-800">
                    <Calendar size={16} />
                    <span>{selectedPost.date}</span>
                  </div>
                </div>

                {/* Severity */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Tingkat Kerusakan</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${selectedPost.severity === 'SERIUS'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-yellow-100 text-yellow-600'
                    }`}>
                    {selectedPost.severity}
                  </span>
                </div>

                {/* Pothole Count */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Jumlah Lubang Terdeteksi</p>
                  <div className="flex items-center gap-2 text-gray-800">
                    <AlertCircle size={16} className="text-orange-500" />
                    <span className="font-bold text-lg">{selectedPost.pothole_count || 0} lubang</span>
                  </div>
                </div>

                {/* Status */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Status Penanganan</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${(selectedPost.status || '').toUpperCase() === 'SELESAI'
                    ? 'bg-green-100 text-green-600'
                    : (selectedPost.status || '').toUpperCase() === 'DIPROSES'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-orange-100 text-orange-600'
                    }`}>
                    {(selectedPost.status || 'MENUNGGU').toUpperCase()}
                  </span>
                </div>

                {/* Verification Votes */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Verifikasi Warga</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-green-600">
                      <ThumbsUp size={16} />
                      <span className="font-bold">{selectedPost.verification?.valid || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-600">
                      <ThumbsDown size={16} />
                      <span className="font-bold">{selectedPost.verification?.false || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alamat Lengkap */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-600 uppercase font-semibold mb-2">Alamat Lengkap</p>
                <div className="flex items-start gap-2 text-gray-800">
                  <MapPin size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p>{selectedPost.address || 'Alamat tidak tersedia'}</p>
                </div>
              </div>

              {/* Detail Lokasi */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Provinsi</p>
                  <p className="text-gray-800">{selectedPost.province || '-'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Kota/Kabupaten</p>
                  <p className="text-gray-800">{selectedPost.city || '-'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Kecamatan</p>
                  <p className="text-gray-800">{selectedPost.district || '-'}</p>
                </div>
              </div>

              {/* Koordinat */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Koordinat GPS</p>
                <p className="text-gray-800 font-mono">{selectedPost.lat}, {selectedPost.long}</p>
                <a
                  href={`https://www.google.com/maps?q=${selectedPost.lat},${selectedPost.long}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-blue-600 hover:underline text-sm"
                >
                  <ExternalLink size={14} />
                  Buka di Google Maps
                </a>
              </div>

              {/* Caption */}
              {selectedPost.caption && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Keterangan</p>
                  <p className="text-gray-800">{selectedPost.caption}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setSelectedPost(null)}
                className="w-full py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}