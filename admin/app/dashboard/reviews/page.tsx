'use client';
import { useState, useEffect } from 'react';
import { getAllProductReviews, updateProductReviewVisibility, deleteProductReview } from '@/lib/api';
import { Trash2, Eye, EyeOff, Star, Search, Loader2 } from 'lucide-react';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await getAllProductReviews();
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const toggleVisibility = async (id: string, currentStatus: boolean) => {
    try {
      await updateProductReviewVisibility(id, !currentStatus);
      setReviews(reviews.map(r => r.id === id ? { ...r, is_active: !currentStatus } : r));
    } catch (err) {
      alert('Failed to update visibility');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return;
    try {
      await deleteProductReview(id);
      setReviews(reviews.filter(r => r.id !== id));
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.author.toLowerCase().includes(search.toLowerCase()) ||
    r.text.toLowerCase().includes(search.toLowerCase()) ||
    r.products?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Product Reviews</h1>
          <p className="text-gray-500 text-sm mt-1">Control which reviews appear on product pages</p>
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews or products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4 w-[400px]">Review Content</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading reviews...</td></tr>
              ) : filteredReviews.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No reviews found.</td></tr>
              ) : filteredReviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">{review.products?.name}</td>
                  <td className="px-6 py-4 text-gray-500">{review.author}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 italic line-clamp-2">"{review.text}"</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleVisibility(review.id, review.is_active)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-colors ${review.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {review.is_active ? <><Eye size={12}/> Active</> : <><EyeOff size={12}/> Hidden</>}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(review.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
