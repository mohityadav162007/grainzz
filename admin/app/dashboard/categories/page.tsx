'use client';
import { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api';
import { Plus, Trash2, Edit2, Loader2, Save, X } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', slug: '', sort_order: 0 });
  const [isAdding, setIsAdding] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (cat: any) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, slug: cat.slug, sort_order: cat.sort_order });
  };

  const handleSave = async (id: string) => {
    try {
      await updateCategory(id, editForm);
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      alert('Failed to update category');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? This will not delete products in it, but you should move them first.`)) return;
    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const name = formData.get('name') as string;
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
    try {
      await createCategory({ name, slug, sort_order: categories.length + 1 });
      setIsAdding(false);
      fetchCategories();
    } catch (err) {
      alert('Failed to create category');
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">Manage product categories</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="admin-btn"
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="admin-card overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Order</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isAdding && (
              <tr className="bg-primary/5">
                <td colSpan={4} className="px-6 py-4">
                  <form onSubmit={handleAdd} className="flex gap-3 items-center">
                    <input name="name" required placeholder="Category Name" className="admin-input flex-1" autoFocus />
                    <button type="submit" className="admin-btn py-2">Create</button>
                    <button type="button" onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-gray-700 font-bold p-2"><X size={20} /></button>
                  </form>
                </td>
              </tr>
            )}
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  {editingId === cat.id ? (
                    <input 
                      value={editForm.name} 
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                      className="admin-input"
                    />
                  ) : (
                    <span className="font-bold text-gray-900">{cat.name}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {editingId === cat.id ? (
                    <input 
                      value={editForm.slug} 
                      onChange={e => setEditForm({...editForm, slug: e.target.value})}
                      className="admin-input"
                    />
                  ) : (
                    cat.slug
                  )}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {editingId === cat.id ? (
                    <input 
                      type="number"
                      value={editForm.sort_order} 
                      onChange={e => setEditForm({...editForm, sort_order: Number(e.target.value)})}
                      className="admin-input w-20"
                    />
                  ) : (
                    cat.sort_order
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {editingId === cat.id ? (
                    <>
                      <button onClick={() => handleSave(cat.id)} className="text-green-600 hover:bg-green-50 p-2 rounded-lg"><Save size={18} /></button>
                      <button onClick={() => setEditingId(null)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-lg"><X size={18} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(cat)} className="text-primary hover:bg-primary/10 p-2 rounded-lg"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(cat.id, cat.name)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={18} /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
