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

  // States untuk Options (Dropdown)
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);

  // States untuk Selected Values
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // 1. Fetch Data Locations (Untuk isi dropdown)
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get(`${apiUrl}/posts/locations`, {
          headers: { "ngrok-skip-browser-warning": "true" }
        });
        if (res.data) {
          setProvinces(res.data.provinces || []);
          setCities(res.data.cities || []);
          setDistricts(res.data.districts || []);
        }
      } catch (error) {
        console.error("Gagal load pilihan lokasi:", error);
      }
    };

    if (apiUrl) fetchLocations();
  }, [apiUrl]);

  // 2. Function Fetch Posts (Bisa semua, bisa difilter)
  const fetchPosts = async (filters: any = null) => {
    setLoading(true);
    try {
      let endpoint = `${apiUrl}/posts`;
      let params = {};

      // Jika ada filters yang dikirim, gunakan endpoint filter
      if (filters && (filters.province || filters.city || filters.district)) {
        endpoint = `${apiUrl}/posts/filter`;
        params = filters;
      }
      // Fallback: Cek state jika argument null (untuk calls tanpa arg)
      else if (selectedProvince || selectedCity || selectedDistrict) {
        endpoint = `${apiUrl}/posts/filter`;
        params = {
          province: selectedProvince,
          city: selectedCity,
          district: selectedDistrict
        };
      }

      console.log(`Fetching map data from: ${endpoint}`, params);

      const res = await axios.get(endpoint, {
        params,
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      });

      if (Array.isArray(res.data)) {
        setPosts(res.data);
      } else {
        console.error("Format data salah:", res.data);
        setPosts([]);
      }

    } catch (error) {
      console.error("Gagal load map data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial Load (Ambil semua post)
  useEffect(() => {
    if (apiUrl) fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  // Handler Tombol "Terapkan Filter"
  const handleApplyFilter = () => {
    fetchPosts({
      province: selectedProvince,
      city: selectedCity,
      district: selectedDistrict
    });
  };

  // Handler Tombol "Reset"
  const handleResetFilter = () => {
    setSelectedProvince('');
    setSelectedCity('');
    setSelectedDistrict('');
    // Fetch ulang clean (tanpa filter)
    fetchPosts({});
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* HEADER: Judul & Filter Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">

        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">🗺️</span> Peta Sebaran Laporan
          </h1>

          {/* Keterangan Warna (Legend) */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full border border-red-100">
              <span className="w-2 h-2 rounded-full bg-red-600 block shadow-sm"></span>
              <span className="font-semibold">Serius</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full border border-yellow-100">
              <span className="w-2 h-2 rounded-full bg-yellow-500 block shadow-sm"></span>
              <span className="font-semibold">Tidak Serius</span>
            </div>
          </div>
        </div>

        {/* INPUTS FILTER */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">

          {/* Dropdown Provinsi */}
          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">Provinsi</label>
            <select
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:bg-white"
            >
              <option value="">Semua Provinsi</option>
              {provinces.map((prov, idx) => (
                <option key={idx} value={prov}>{prov}</option>
              ))}
            </select>
          </div>

          {/* Dropdown Kota */}
          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">Kota/Kab</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:bg-white"
            >
              <option value="">Semua Kota</option>
              {cities.map((city, idx) => (
                <option key={idx} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Dropdown Kecamatan */}
          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">Kecamatan</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:bg-white"
            >
              <option value="">Semua Kecamatan</option>
              {districts.map((dist, idx) => (
                <option key={idx} value={dist}>{dist}</option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="md:col-span-3 grid grid-cols-2 gap-2">
            <button
              onClick={handleResetFilter}
              className="flex justify-center items-center px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
            >
              Reset
            </button>
            <button
              onClick={handleApplyFilter}
              className="flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition hover:shadow-md"
            >
              Terapkan
            </button>
          </div>

        </div>
      </div>

      {/* CONTAINER PETA */}
      <div className="flex-1 min-h-[500px] bg-white p-1 rounded-xl shadow-sm border border-gray-200 overflow-hidden relative group">
        <MapView posts={posts} />

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-[1000] flex flex-col items-center justify-center animate-fadeIn">
            <div className="bg-white p-4 rounded-full shadow-xl mb-3">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
            <p className="text-gray-600 font-semibold text-sm bg-white px-3 py-1 rounded-full shadow-sm">Memuat Data...</p>
          </div>
        )}

        {/* Info Count */}
        {!loading && (
          <div className="absolute bottom-4 left-4 z-[999] bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg border border-gray-200">
            <p className="text-sm font-bold text-gray-700">
              Ditampilkan: <span className="text-blue-600 text-lg">{posts.length}</span> Laporan
            </p>
          </div>
        )}
      </div>
    </div>
  );
}