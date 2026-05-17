'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Loader2, GripVertical } from 'lucide-react';

export default function AnnouncementBarEditor({
  config,
  onSave,
  saving
}: {
  config: any;
  onSave: (config: any) => void;
  saving: boolean;
}) {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    if (config?.messages && Array.isArray(config.messages) && config.messages.filter(m => m.trim() !== '').length > 0) {
      setMessages(config.messages.filter(m => m.trim() !== ''));
    } else if (config?.text && config.text.trim() !== '') {
      setMessages([config.text]);
    } else {
      setMessages(['Start this year with a healthy choice: Shipping PAN India 🇮🇳']);
    }
  }, [config]);

  const handleAddMessage = () => {
    setMessages([...messages, 'New announcement message']);
  };

  const handleRemoveMessage = (index: number) => {
    const newMessages = [...messages];
    newMessages.splice(index, 1);
    setMessages(newMessages);
  };

  const handleUpdateMessage = (index: number, value: string) => {
    const newMessages = [...messages];
    newMessages[index] = value;
    setMessages(newMessages);
  };

  const handleSave = () => {
    // Save as messages array
    onSave({ messages: messages.filter(m => m.trim() !== '') });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Announcement Bar</h2>
          <p className="text-sm text-gray-500">Manage the scrolling announcement messages at the top of the website. (Supports 🇮🇳 emoji)</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="admin-btn-primary flex items-center gap-2"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Announcements
        </button>
      </div>

      <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No messages configured. Add one below.</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-gray-400 cursor-grab">
                <GripVertical size={20} />
              </div>
              <input
                type="text"
                value={msg}
                onChange={(e) => handleUpdateMessage(index, e.target.value)}
                className="admin-input flex-1"
                placeholder="E.g., Free shipping on orders over ₹999!"
              />
              <button 
                onClick={() => handleRemoveMessage(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove message"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}

        <button 
          onClick={handleAddMessage}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={18} /> Add Message
        </button>
      </div>
    </div>
  );
}
