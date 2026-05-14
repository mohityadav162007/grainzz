'use client';
import { useState, useEffect } from 'react';
import { getBlogs, deleteBlog } from '@/lib/api';
import { Edit, Trash2, Plus, Search, Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await getBlogs();
      setBlogs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteBlog(id);
      fetchBlogs();
    } catch (err) {
      alert('Failed to delete blog');
    }
  };

  const filteredBlogs = blogs.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Blog Posts</h1>
          <p className="text-gray-500 text-sm mt-1">Total: {blogs.length}</p>
        </div>
        <Link href="/dashboard/blogs/new" className="admin-btn self-start sm:self-auto">
          <Plus size={18} /> Add New Blog
        </Link>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search blogs..."
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
                <th className="px-6 py-4">Blog Post</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 animate-pulse" />
                      <div className="h-4 w-48 bg-gray-100 animate-pulse rounded" />
                    </td>
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-100 animate-pulse rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 w-16 bg-gray-100 animate-pulse rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No blog posts found.</td>
                </tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="border-b last:border-0 hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                      {blog.featured_image_url ? (
                        <img src={blog.featured_image_url} alt={blog.title} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                          <ImageIcon size={16} />
                        </div>
                      )}
                      <div className="flex flex-col max-w-[300px]">
                        <span className="truncate font-bold">{blog.title}</span>
                        <span className="text-xs text-gray-400 truncate">{blog.excerpt || 'No excerpt'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{blog.slug}</td>
                    <td className="px-6 py-4">
                      {blog.is_active ? (
                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-semibold">Active</span>
                      ) : (
                        <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-md text-xs font-semibold">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(blog.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link href={`/dashboard/blogs/${blog.id}/edit`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-primary hover:bg-primary/10 transition-colors">
                        <Edit size={16} />
                      </Link>
                      <button onClick={() => handleDelete(blog.id, blog.title)} className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
