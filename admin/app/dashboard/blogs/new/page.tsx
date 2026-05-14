'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBlog } from '@/lib/api';
import { ArrowLeft, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function NewBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const form = new FormData(e.currentTarget);
      form.set('content', content);
      if (imageFile) form.append('featured_image', imageFile);

      await createBlog(form);
      router.push('/dashboard/blogs');
    } catch (err: any) {
      setError(err.message || 'Failed to create blog');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'clean'],
    ],
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/blogs" className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Add New Blog</h1>
          <p className="text-gray-500 text-sm">Create a new blog post for your visitors</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="admin-card p-6 space-y-5">
          <h2 className="font-bold text-gray-900 text-lg border-b pb-3 mb-4">Blog Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Blog Title *</label>
              <input 
                name="title" 
                required 
                className="admin-input" 
                placeholder="e.g. 5 Benefits of Whole Grains" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Slug (optional)</label>
                <input 
                  name="slug" 
                  className="admin-input font-mono text-sm" 
                  placeholder="e.g. benefits-of-whole-grains" 
                />
                <p className="text-[10px] text-gray-400 mt-1">Leave empty to auto-generate from title</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Sort Order</label>
                <input 
                  name="sort_order" 
                  type="number" 
                  defaultValue={0} 
                  className="admin-input" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Short Excerpt (optional)</label>
              <textarea 
                name="excerpt" 
                rows={2} 
                className="admin-input text-sm" 
                placeholder="A brief summary of the blog post for the listing page..." 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Featured Image (optional)</label>
              <div className="mt-1 flex items-center gap-4">
                <div className="w-32 h-32 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
                  {imageFile ? (
                    <img src={URL.createObjectURL(imageFile)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="text-gray-300" size={32} />
                  )}
                  <input 
                    type="file" 
                    required={false}
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                  />
                </div>
                <div className="text-xs text-gray-500">
                  <p className="font-bold text-gray-700 mb-1">Click to upload featured image</p>
                  <p>Recommended size: 1200x630px</p>
                  <p>Max size: 2MB</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Blog Content *</label>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden min-h-[400px]">
                <ReactQuill 
                  theme="snow" 
                  value={content} 
                  onChange={setContent}
                  modules={modules}
                  className="h-[350px] mb-12"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <input 
                name="is_active" 
                type="checkbox" 
                value="true" 
                defaultChecked={true} 
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" 
              />
              <label className="text-sm font-semibold text-gray-700">Publish immediately (Active)</label>
            </div>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="admin-btn h-11 px-8">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Publishing...</> : 'Save Blog Post'}
          </button>
          <Link href="/dashboard/blogs" className="px-6 h-11 flex items-center text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
