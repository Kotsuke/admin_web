'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Search, User, Shield, Mail, Edit, X, Phone, Award, UserPlus, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';

// Interface untuk User
interface UserData {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  phone: string;
  bio: string;
  points: number;
}

// Interface untuk Form
interface FormData {
  full_name: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  role: string;
  points: number;
  password: string;
}

const initialFormData: FormData = {
  full_name: '',
  username: '',
  email: '',
  phone: '',
  bio: '',
  role: 'user',
  points: 0,
  password: ''
};

export default function ManageUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // State untuk Dialog
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Helper: Ambil token dari cookies
  const getToken = () => {
    const adminData = Cookies.get('admin_token');
    return adminData ? JSON.parse(adminData).token : null;
  };

  // 1. Ambil Data User
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await axios.get(`${apiUrl}/users`, {
        headers: { "ngrok-skip-browser-warning": "true" }
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

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Buka Dialog Create
  const openCreateDialog = () => {
    setDialogMode('create');
    setEditingUser(null);
    setFormData(initialFormData);
    setShowPassword(false);
  };

  // 3. Buka Dialog Edit
  const openEditDialog = (user: UserData) => {
    setDialogMode('edit');
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      phone: user.phone || '',
      bio: user.bio || '',
      role: user.role,
      points: user.points || 0,
      password: ''
    });
    setShowPassword(false);
  };

  // 4. Tutup Dialog
  const closeDialog = () => {
    setDialogMode(null);
    setEditingUser(null);
    setFormData(initialFormData);
    setShowPassword(false);
  };

  // 5. Handle Input Change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'points' ? parseInt(value) || 0 : value
    }));
  };

  // 6. Submit Form (Create atau Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = getToken();
      const headers = {
        "ngrok-skip-browser-warning": "true",
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      if (dialogMode === 'create') {
        // CREATE USER
        if (!formData.password) {
          Swal.fire('Error', 'Password wajib diisi untuk user baru!', 'error');
          setSaving(false);
          return;
        }

        const res = await axios.post(`${apiUrl}/admin/users`, formData, { headers });
        setUsers([...users, res.data.user]);

        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'User baru berhasil dibuat.',
          timer: 2000,
          showConfirmButton: false
        });

      } else if (dialogMode === 'edit' && editingUser) {
        // EDIT USER
        const updateData: any = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }

        const res = await axios.put(`${apiUrl}/admin/users/${editingUser.id}`, updateData, { headers });
        setUsers(users.map(u => u.id === editingUser.id ? res.data.user : u));

        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data user berhasil diperbarui.',
          timer: 2000,
          showConfirmButton: false
        });
      }

      closeDialog();
    } catch (error: any) {
      Swal.fire('Gagal!', error.response?.data?.error || 'Terjadi kesalahan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 7. Hapus User
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
        const token = getToken();

        await axios.delete(`${apiUrl}/users/${userId}`, {
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
          }
        });

        setUsers(users.filter((u) => u.id !== userId));
        Swal.fire('Terhapus!', 'User telah dihapus.', 'success');
      } catch (error: any) {
        Swal.fire('Gagal!', error.response?.data?.error || 'Terjadi kesalahan.', 'error');
      }
    }
  };

  // 8. Filter Search
  const filteredUsers = users.filter((user) =>
    user.full_name.toLowerCase().includes(search.toLowerCase()) ||
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center">Loading Users...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Data Pengguna</h1>

        <div className="flex items-center gap-3">
          {/* Tombol Tambah User */}
          <button
            onClick={openCreateDialog}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-medium"
          >
            <UserPlus size={18} />
            Tambah User
          </button>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari nama/email..."
              value={search}
              className="pl-9 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 text-black w-64"
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-2.5 top-2.5 text-gray-400" size={16} />
          </div>
        </div>
      </div>

      {/* Tabel User */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 uppercase text-xs font-bold">
            <tr>
              <th className="px-6 py-4">Nama Lengkap</th>
              <th className="px-6 py-4">Akun</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Poin</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-blue-50/50 transition-colors">

                {/* Kolom Nama */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${user.role === 'admin'
                        ? 'bg-gradient-to-br from-purple-500 to-purple-700'
                        : 'bg-gradient-to-br from-blue-500 to-blue-700'
                      }`}>
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">{user.full_name}</span>
                      {user.phone && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone size={10} />
                          {user.phone}
                        </div>
                      )}
                    </div>
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
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit shadow-sm ${user.role === 'admin'
                      ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 border border-purple-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                    {user.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                    {user.role.toUpperCase()}
                  </span>
                </td>

                {/* Kolom Poin */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-amber-600 font-bold">
                    <Award size={16} className="text-amber-500" />
                    {user.points || 0}
                  </div>
                </td>

                {/* Kolom Aksi */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => openEditDialog(user)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all hover:scale-105"
                      title="Edit User"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id, user.username)}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all hover:scale-105"
                      title="Hapus User"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>

              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  User tidak ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ========== DIALOG CREATE / EDIT USER ========== */}
      {dialogMode && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && closeDialog()}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Dialog */}
            <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  {dialogMode === 'create' ? <UserPlus size={20} className="text-white" /> : <Edit size={20} className="text-white" />}
                </div>
                <h2 className="text-xl font-bold text-white">
                  {dialogMode === 'create' ? 'Buat User Baru' : 'Edit User'}
                </h2>
              </div>
              <button
                onClick={closeDialog}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Masukkan nama lengkap"
                  className="w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black transition-all"
                />
              </div>

              {/* Username & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    placeholder="username"
                    className="w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 text-black transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="email@domain.com"
                    className="w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 text-black transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">No. Telepon</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="08xxxxxxxxxx"
                    className="w-full pl-10 pr-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 text-black transition-all"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 text-black resize-none transition-all"
                  placeholder="Deskripsi singkat tentang user..."
                />
              </div>

              {/* Role & Points */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 text-black transition-all bg-white"
                  >
                    <option value="user">👤 User</option>
                    <option value="admin">🛡️ Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Poin</label>
                  <input
                    type="number"
                    name="points"
                    value={formData.points}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 text-black transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {dialogMode === 'create' ? (
                    <>Password <span className="text-red-500">*</span></>
                  ) : (
                    <>Password Baru <span className="text-gray-400 font-normal">(kosongkan jika tidak diubah)</span></>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={dialogMode === 'create'}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 text-black transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Tombol Submit */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-xl ${saving ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Menyimpan...
                    </span>
                  ) : (
                    dialogMode === 'create' ? '✨ Buat User' : '💾 Simpan Perubahan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}