'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Star, Trash2, Filter, ArrowUpDown } from 'lucide-react';
import Swal from 'sweetalert2';

interface Review {
    id: number;
    user_id: number;
    username: string;
    full_name: string;
    rating: number;
    comment: string | null;
    sentiment: string | null;
    created_at: string;
}

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State untuk sorting dan filtering
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [filterRating, setFilterRating] = useState<number | 'all'>('all');

    const fetchReviews = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const res = await fetch(`${apiUrl}/reviews`, {
                headers: {
                    "ngrok-skip-browser-warning": "true"
                }
            });
            if (!res.ok) throw new Error('Gagal mengambil data review');
            const data = await res.json();
            setReviews(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Hapus Review?',
            text: "Review yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            try {
                const token = Cookies.get('admin_token');
                const session = token ? JSON.parse(token) : null;
                const jwt = session?.token;

                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                const res = await fetch(`${apiUrl}/reviews/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${jwt}`,
                        "ngrok-skip-browser-warning": "true"
                    }
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || 'Gagal menghapus review');
                }

                // Refresh data
                setReviews(reviews.filter(r => r.id !== id));
                Swal.fire(
                    'Terhapus!',
                    'Review berhasil dihapus.',
                    'success'
                );
            } catch (err: any) {
                Swal.fire(
                    'Gagal!',
                    err.message,
                    'error'
                );
            }
        }
    };

    // Logika Filter & Sorting
    const filteredReviews = reviews
        .filter(r => filterRating === 'all' || r.rating === filterRating)
        .sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

    if (loading) return <div className="p-8 text-center text-gray-500">Memuat data review...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Analisa Review & Rating</h1>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                        <ArrowUpDown size={16} className="text-gray-500" />
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                            className="bg-transparent text-sm text-gray-700 focus:outline-none cursor-pointer"
                        >
                            <option value="desc">Terbaru</option>
                            <option value="asc">Terlama</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                        <Filter size={16} className="text-gray-500" />
                        <select
                            value={filterRating}
                            onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                            className="bg-transparent text-sm text-gray-700 focus:outline-none cursor-pointer"
                        >
                            <option value="all">Semua Bintang</option>
                            <option value="5">5 Bintang</option>
                            <option value="4">4 Bintang</option>
                            <option value="3">3 Bintang</option>
                            <option value="2">2 Bintang</option>
                            <option value="1">1 Bintang</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Total Review</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{reviews.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Rata-rata Rating</h3>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">
                        {reviews.length > 0
                            ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                            : '0.0'}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Review Bintang 5</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                        {reviews.filter(r => r.rating === 5).length}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">ID</th>
                                <th className="p-4 font-semibold text-gray-600">User</th>
                                <th className="p-4 font-semibold text-gray-600">Rating</th>
                                <th className="p-4 font-semibold text-gray-600">Komentar</th>
                                <th className="p-4 font-semibold text-gray-600">Sentimen</th>
                                <th className="p-4 font-semibold text-gray-600">Tanggal</th>
                                <th className="p-4 font-semibold text-gray-600 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredReviews.map((review) => (
                                <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-500">#{review.id}</td>
                                    <td className="p-4">
                                        <div className="font-medium text-gray-800">{review.full_name}</div>
                                        <div className="text-xs text-gray-500">@{review.username}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold text-gray-800">{review.rating}</span>
                                            <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600 max-w-xs truncate" title={review.comment || ''}>
                                        {review.comment || '-'}
                                    </td>
                                    <td className="p-4">
                                        {review.sentiment ? (
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${review.sentiment === 'positif'
                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                : 'bg-red-100 text-red-700 border border-red-200'
                                                }`}>
                                                {review.sentiment === 'positif' ? 'Positif' : 'Negatif'}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">Belum Dianalisis</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-gray-500 whitespace-nowrap">
                                        {review.created_at}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Hapus Review"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredReviews.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        Tidak ada review yang sesuai filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
