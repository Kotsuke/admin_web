'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Star, Trash2 } from 'lucide-react';

interface Review {
    id: number;
    user_id: number;
    username: string;
    full_name: string;
    rating: number;
    comment: string | null;
    created_at: string;
}

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
        if (!confirm('Apakah Anda yakin ingin menghapus review ini?')) return;

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
            alert('Review berhasil dihapus');
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Memuat data review...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Analisa Review & Rating</h1>

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
                                <th className="p-4 font-semibold text-gray-600">Tanggal</th>
                                <th className="p-4 font-semibold text-gray-600 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {reviews.map((review) => (
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
                            {reviews.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        Belum ada review yang masuk.
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
