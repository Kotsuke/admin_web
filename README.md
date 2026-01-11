# 🖥️ SmartInfra Admin Panel

**SmartInfra Admin** adalah panel dashboard berbasis web yang dirancang khusus untuk administrator guna memantau aktivitas, mengelola konten, dan menganalisis data dari ekosistem aplikasi SmartInfra.

Dibangun dengan **Next.js** dan desain modern yang responsif, dashboard ini memberikan kontrol penuh atas pelaporan kerusakan jalan dan manajemen pengguna.

---

## ✨ Fitur & Fungsi Utama

### 1. 📊 Dashboard Analytics (Overview)
Halaman utama yang menyajikan ringkasan data vital secara real-time:
*   **Statistik Utama:** Total laporan, kerusakan serius, total pengguna, dan rating aplikasi.
*   **Grafik Pertumbuhan:** Visualisasi tren penambahan user baru dan postingan baru (Harian, Mingguan, Bulanan).

### 2. 👥 Manajemen Pengguna (User Management)
Kontrol penuh terhadap data pengguna aplikasi mobile:
*   **Daftar Pengguna:** Melihat seluruh pengguna terdaftar.
*   **Edit Profil User:** Kemampuan admin untuk mengubah data user jika diperlukan (Reset password, update info, dll).
*   **Role Management:** Memantau role pengguna (User/Admin).

### 3. 📝 Manajemen Laporan (Post Management)
Memantau laporan jalan rusak yang masuk dari pengguna:
*   **List Laporan:** Melihat daftar laporan dengan detail foto, lokasi, dan tingkat keparahan (Serius/Tidak).
*   **Verifikasi:** Memantau hasil validasi AI dan voting komunitas terhadap laporan tersebut.

### 4. 🗺️ Peta Infrastruktur (Interactive Map)
Visualisasi berbasis geografis untuk sebaran kerusakan jalan:
*   **Marker Kerusakan:** Melihat titik-titik kerusakan jalan di peta interaktif (Leaflet).
*   **Detail Lokasi:** Klik marker untuk melihat detail laporan spesifik di lokasi tersebut.

### 5. ⭐ Review & Feedback
Memantau kepuasan pengguna:
*   Melihat ulasan dan rating yang diberikan pengguna terhadap aplikasi.

---

## 🛠️ Teknologi

Panel admin ini dibangun menggunakan _Modern Web Stack_:
*   **Framework:** Next.js 15+ (App Router)
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React
*   **Charts:** Recharts
*   **Maps:** React-Leaflet
*   **HTTP Client:** Axios

---

## 🚀 Cara Menjalankan (Development)

Pastikan Node.js (v18+) sudah terinstall di komputer Anda.

1.  **Masuk ke Direktori**
    ```bash
    cd smart-infra-admin
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    # atau
    yarn install
    ```

3.  **Konfigurasi Environment**
    Pastikan file `.env.local` sudah ada dan dikonfigurasi dengan benar (terutama URL Backend).
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:5000/api
    ```

4.  **Jalankan Server Development**
    ```bash
    npm run dev
    ```
    Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 📦 Build untuk Produksi

Jika ingin men-deploy aplikasi:

```bash
npm run build
npm start
```
