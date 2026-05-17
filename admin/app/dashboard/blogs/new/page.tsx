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
        <div className="admin-card p-6 space-y-5">
          <details className="group">
            <summary className="font-bold text-gray-900 text-lg border-b pb-3 mb-4 cursor-pointer flex justify-between items-center list-none">
              <span>SEO Settings (Optional)</span>
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">SEO Title</label>
                <input name="seo_title" className="admin-input" placeholder="Custom title for search engines (defaults to Blog Title)" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Meta Description</label>
                <textarea name="meta_description" rows={2} className="admin-input text-sm" placeholder="Search engine description (defaults to Excerpt)" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Meta Keywords</label>
                <input name="meta_keywords" className="admin-input" placeholder="e.g. healthy snacks, millet, diet (comma separated)" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Canonical URL</label>
                <input name="canonical_url" className="admin-input font-mono text-sm" placeholder="Override canonical URL if this is republished content" />
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm">Social Media (Open Graph)</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">OG Title</label>
                    <input name="og_title" className="admin-input" placeholder="Title for Facebook/Twitter (defaults to SEO Title)" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">OG Description</label>
                    <textarea name="og_description" rows={2} className="admin-input text-sm" placeholder="Description for social shares (defaults to Meta Description)" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">OG Image</label>
                    <div className="mt-1 flex items-center gap-4">
                      <div className="w-32 h-32 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
                        <ImageIcon className="text-gray-300" size={32} />
                        <input 
                          type="file" 
                          name="og_image"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept="image/*"
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        <p className="font-bold text-gray-700 mb-1">Click to upload social image</p>
                        <p>Recommended: 1200x630px</p>
                        <p>Defaults to Featured Image</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t mt-4">
                <input 
                  name="is_indexable" 
                  type="checkbox" 
                  value="true" 
                  defaultChecked={true} 
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" 
                />
                <label className="text-sm font-semibold text-gray-700">Allow search engines to index this post</label>
              </div>
            </div>
          </details>
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
