'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic'; // Import Dynamic Next.js

// Import MapView secara Lazy/Dynamic (SS: false)
// Ini KUNCI agar tidak error "Window is not defined" karena Leaflet butuh browser
const MapView = dynamic(() => import('./MapView'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 animate-pulse rounded-xl flex flex-col items-center justify-center text-gray-400">
        <p className="font-semibold">Memuat Peta...</p>
    </div>
  )
});

export default function MapPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        
        // 👇 PERBAIKAN UTAMA: Tambah Headers Ngrok disini
        const res = await axios.get(`${apiUrl}/posts`, {
            headers: {
                "ngrok-skip-browser-warning": "true"
            }
        });
        
        // 🛡️ PENGAMAN: Cek apakah datanya benar-benar Array?
        if (Array.isArray(res.data)) {
          setPosts(res.data);
        } else {
          console.error("Format data map salah, dapatnya:", res.data);
          setPosts([]); // Set kosong biar map tetap muncul walau tanpa pin
        }

      } catch (error) {
        console.error("Gagal load map data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* HEADER PETA */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Peta Sebaran Kerusakan</h1>
        
        {/* LEGENDA / KETERANGAN WARNA */}
        <div className="flex gap-4 text-sm bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600 block shadow-sm"></span>
            <span className="text-gray-700 font-medium">Serius</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 block shadow-sm"></span>
            <span className="text-gray-700 font-medium">Ringan</span>
          </div>
        </div>
      </div>

      {/* CONTAINER PETA */}
      <div className="flex-1 min-h-[500px] bg-white p-1 rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
        <MapView posts={posts} />
      </div>
    </div>
  );
}