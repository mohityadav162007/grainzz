'use client';
import { useState, useEffect } from 'react';
import { getStoreSettings, updateStoreSetting } from '@/lib/api';
import { Loader2, Save, Settings as SettingsIcon } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await getStoreSettings();
      let data = res.data || [];
      // Ensure show_sale_page is in the list
      if (!data.find((s: any) => s.key === 'show_sale_page')) {
        data.push({ 
          key: 'show_sale_page', 
          value: 'true', 
          description: 'Whether to show the Sale page and menu item on the website.' 
        });
      }
      // Ensure social_linkedin is in the list
      if (!data.find((s: any) => s.key === 'social_linkedin')) {
        data.push({ 
          key: 'social_linkedin', 
          value: '', 
          description: 'LinkedIn profile URL for the footer.' 
        });
      }
      // Ensure shiprocket_pickup_location is in the list
      if (!data.find((s: any) => s.key === 'shiprocket_pickup_location')) {
        data.push({ 
          key: 'shiprocket_pickup_location', 
          value: 'warehouse', 
          description: 'The exact Nickname of your pickup location in Shiprocket.' 
        });
      }
      // Filter out Twitter/X as requested
      data = data.filter((s: any) => s.key !== 'social_twitter');
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = async (key: string, value: string) => {
    setSaving(key);
    try {
      await updateStoreSetting(key, value);
      // Update local state to reflect change without re-fetching
      setSettings((prev) => prev.map((s) => s.key === key ? { ...s, value } : s));
    } catch (err: any) {
      alert(`Failed to update ${key}: ${err.message}`);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Store Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage global website content like contact info and social links.</p>
        </div>
      </div>

      <div className="admin-card p-6">
        <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
          <SettingsIcon size={20} className="text-primary" /> Global Configurations
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl">
            {settings.map((setting) => (
              <div key={setting.key} className="flex flex-col md:flex-row md:items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="md:w-1/3">
                  <label className="block text-sm font-bold text-gray-900 capitalize">
                    {setting.key.replace(/_/g, ' ')}
                  </label>
                  <p className="text-xs text-gray-500 mt-0.5">{setting.description}</p>
                </div>
                <div className="flex-1 flex gap-3">
                  {setting.key === 'show_sale_page' ? (
                    <button
                      onClick={() => handleUpdate(setting.key, setting.value === 'true' ? 'false' : 'true')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        setting.value === 'true' ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          setting.value === 'true' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  ) : setting.key === 'contact_address' || setting.key === 'about_text' ? (
                    <textarea
                      className="admin-input flex-1 min-h-[80px]"
                      defaultValue={setting.value}
                      onBlur={(e) => handleUpdate(setting.key, e.target.value)}
                    />
                  ) : (
                    <input
                      type="text"
                      className="admin-input flex-1"
                      defaultValue={setting.value}
                      onBlur={(e) => handleUpdate(setting.key, e.target.value)}
                    />
                  )}
                  <div className="flex items-center justify-center w-8">
                    {saving === setting.key && <Loader2 size={16} className="animate-spin text-primary" />}
                    {saving !== setting.key && <Save size={16} className="text-green-500 opacity-50" />}
                  </div>
                </div>
              </div>
            ))}
            
            {settings.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                No settings found. Please run the database migration.
              </div>
            )}
            
            {settings.length > 0 && (
              <p className="text-xs text-gray-400 mt-4 italic">
                * Changes are saved automatically when you click outside the input box.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
