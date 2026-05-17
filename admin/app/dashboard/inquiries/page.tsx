'use client';
import { useState, useEffect } from 'react';
import { getEnquiries, updateEnquiryStatus, deleteEnquiry } from '@/lib/api';
import { Trash2, Mail, MailOpen, Reply, CheckCircle2, Search, Loader2, Eye, ChevronDown, X, Clock } from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700', icon: Mail },
  read: { label: 'Read', color: 'bg-yellow-100 text-yellow-700', icon: MailOpen },
  replied: { label: 'Replied', color: 'bg-green-100 text-green-700', icon: Reply },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-500', icon: CheckCircle2 },
};

export default function InquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await getEnquiries();
      setEnquiries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEnquiries(); }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateEnquiryStatus(id, status);
      setEnquiries(enquiries.map(e => e.id === id ? { ...e, status } : e));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this inquiry permanently?')) return;
    try {
      await deleteEnquiry(id);
      setEnquiries(enquiries.filter(e => e.id !== id));
    } catch (err) {
      alert('Failed to delete inquiry');
    }
  };

  const toggleExpand = (id: string) => {
    // Auto mark as read when expanding
    const enq = enquiries.find(e => e.id === id);
    if (enq && enq.status === 'new') {
      handleStatusChange(id, 'read');
    }
    setExpandedId(expandedId === id ? null : id);
  };

  const filtered = enquiries.filter(e => {
    const matchSearch = !search || 
      `${e.first_name} ${e.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase()) ||
      e.subject?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const newCount = enquiries.filter(e => e.status === 'new').length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            Inquiries
            {newCount > 0 && (
              <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">{newCount} new</span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Contact form submissions from customers</p>
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-9 w-full"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'new', 'read', 'replied', 'closed'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  filterStatus === s 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {s === 'all' ? 'All' : STATUS_MAP[s]?.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="px-6 py-12 text-center text-gray-500 flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" /> Loading inquiries...
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">
              <Mail size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No inquiries found</p>
            </div>
          ) : filtered.map((enq) => {
            const status = STATUS_MAP[enq.status] || STATUS_MAP.new;
            const StatusIcon = status.icon;
            const isExpanded = expandedId === enq.id;

            return (
              <div key={enq.id} className={`${enq.status === 'new' ? 'bg-blue-50/30' : ''}`}>
                {/* Summary Row */}
                <div
                  onClick={() => toggleExpand(enq.id)}
                  className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                >
                  {/* Status dot */}
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${enq.status === 'new' ? 'bg-blue-500' : enq.status === 'read' ? 'bg-yellow-500' : enq.status === 'replied' ? 'bg-green-500' : 'bg-gray-300'}`} />

                  {/* Name + Email */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${enq.status === 'new' ? 'font-black text-gray-900' : 'font-semibold text-gray-700'}`}>
                        {enq.first_name} {enq.last_name}
                      </span>
                      <span className="text-xs text-gray-400 truncate">&lt;{enq.email}&gt;</span>
                      {(enq.order_id === 'B2B' || enq.subject === 'B2B Partnership Inquiry') && (
                        <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0">
                          B2B
                        </span>
                      )}
                    </div>
                    <p className={`text-sm truncate mt-0.5 ${enq.status === 'new' ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                      {enq.subject}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0 ${status.color}`}>
                    <StatusIcon size={12} /> {status.label}
                  </span>

                  {/* Time */}
                  <span className="text-xs text-gray-400 flex-shrink-0 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(enq.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </span>

                  {/* Expand arrow */}
                  <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="px-6 pb-5 pt-1 bg-white border-t border-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6">
                      {/* Message Content */}
                      <div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</label>
                            <p className="text-sm font-medium text-gray-800 mt-0.5">{enq.email}</p>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone</label>
                            <p className="text-sm font-medium text-gray-800 mt-0.5">{enq.phone || '—'}</p>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Order ID</label>
                            <p className="text-sm font-medium text-gray-800 mt-0.5">{enq.order_id || '—'}</p>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</label>
                            <p className="text-sm font-medium text-gray-800 mt-0.5">
                              {new Date(enq.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Message</label>
                          <div className="mt-2 p-4 bg-gray-50 rounded-xl text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {enq.message || <span className="text-gray-400 italic">No message provided</span>}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 min-w-[160px]">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Update Status</label>
                        {['new', 'read', 'replied', 'closed'].map(s => {
                          const st = STATUS_MAP[s];
                          const StIcon = st.icon;
                          return (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(enq.id, s)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                                enq.status === s 
                                  ? `${st.color} ring-2 ring-offset-1 ring-gray-300` 
                                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                              }`}
                            >
                              <StIcon size={14} /> {st.label}
                            </button>
                          );
                        })}
                        <div className="border-t border-gray-100 pt-2 mt-2">
                          <button
                            onClick={() => handleDelete(enq.id)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-colors w-full"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
