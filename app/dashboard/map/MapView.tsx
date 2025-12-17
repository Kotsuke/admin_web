'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- FIX: Masalah Icon Default Leaflet yang suka hilang di Next.js ---
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: iconUrl,
  iconRetinaUrl: iconRetinaUrl,
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom Icon Merah untuk yang PARAH (Optional)
const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function MapView({ posts }: { posts: any[] }) {
  // Tentukan titik tengah peta (Default: Jakarta/Indonesia)
  // Ganti koordinat ini sesuai kota kamu (Misal Semarang: -6.966667, 110.416664)
  const center: [number, number] = [-6.9932, 110.4203]; 

  return (
    <MapContainer 
      center={center} 
      zoom={13} 
      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
    >
      {/* Skin Peta: OpenStreetMap (Gratis) */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {posts.map((post) => (
        <Marker 
          key={post.id} 
          position={[post.lat, post.long]}
          // Kalau SERIUS pakai icon Merah, kalau biasa pakai Biru
          icon={post.severity === 'SERIUS' ? redIcon : defaultIcon}
        >
          <Popup>
            <div className="text-center">
              <img 
                src={post.image_url} 
                alt="Bukti" 
                className="w-32 h-20 object-cover rounded mb-2 mx-auto"
                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
              />
              <h3 className="font-bold text-sm">{post.uploaded_by}</h3>
              <p className="text-xs text-gray-500">{post.date}</p>
              <div className={`mt-1 text-xs px-2 py-1 rounded text-white font-bold ${
                post.severity === 'SERIUS' ? 'bg-red-500' : 'bg-green-500'
              }`}>
                {post.severity}
              </div>
              <p className="text-xs mt-1">{post.pothole_count} Lubang</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}