'use client';
import { useState, useEffect, useCallback } from 'react';
import { getOrders, syncAllTrackingStatuses, trackShipment, requestAwb } from '@/lib/api';
import { RefreshCw, ExternalLink, Truck, Package, XCircle, CheckCircle2, AlertTriangle, Search } from 'lucide-react';

const deliveryBadge = (status: string) => {
  if (!status) return 'bg-gray-100 text-gray-500';
  const s = status.toLowerCase();
  if (s.includes('deliver')) return 'bg-emerald-100 text-emerald-700';
  if (s.includes('transit')) return 'bg-blue-100 text-blue-700';
  if (s.includes('out for')) return 'bg-amber-100 text-amber-700';
  if (s.includes('shipped')) return 'bg-indigo-100 text-indigo-700';
  if (s.includes('cancel') || s.includes('rto')) return 'bg-red-100 text-red-700';
  if (s.includes('new') || s.includes('process')) return 'bg-sky-100 text-sky-700';
  return 'bg-gray-100 text-gray-600';
};

export default function ShipmentsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [trackingModal, setTrackingModal] = useState<{ orderId: string; data: any } | null>(null);

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOrders({});
      const shipped = (res.data || []).filter((o: any) => o.is_sent_to_shiprocket);
      setOrders(shipped);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchShipments(); }, [fetchShipments]);
  useEffect(() => { if (result) { const t = setTimeout(() => setResult(null), 5000); return () => clearTimeout(t); } }, [result]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const r = await syncAllTrackingStatuses();
      setResult({ type: 'success', message: `Synced: ${r.updated || 0} updated out of ${r.total || 0} active` });
      fetchShipments();
    } catch (err: any) { setResult({ type: 'error', message: err.message }); }
    finally { setSyncing(false); }
  };

  const handleTrack = async (order: any) => {
    try {
      const r = await trackShipment({ awbCode: order.awb_code || undefined, shipmentId: order.shipment_id || undefined });
      setTrackingModal({ orderId: order.id, data: r.tracking });
    } catch (err: any) { setResult({ type: 'error', message: err.message }); }
  };

  const handleRequestAwb = async (order: any) => {
    if (!order.shipment_id) return;
    try {
      const r = await requestAwb(order.shipment_id);
      setResult({ type: 'success', message: `AWB assigned: ${r.awb_code} via ${r.courier_name}` });
      fetchShipments();
    } catch (err: any) { setResult({ type: 'error', message: err.message }); }
  };

  const filtered = orders.filter(o => {
    if (search) {
      const q = search.toLowerCase();
      if (!o.user_name?.toLowerCase().includes(q) && !o.awb_code?.toLowerCase().includes(q) && !o.id?.toLowerCase().includes(q)) return false;
    }
    if (statusFilter && o.delivery_status !== statusFilter) return false;
    return true;
  });

  const statusOptions = [...new Set(orders.map(o => o.delivery_status).filter(Boolean))];

  // Summary stats
  const total = orders.length;
  const delivered = orders.filter(o => o.delivery_status?.toLowerCase().includes('deliver')).length;
  const inTransit = orders.filter(o => o.delivery_status?.toLowerCase().includes('transit') || o.delivery_status?.toLowerCase().includes('shipped')).length;
  const pending = total - delivered - inTransit;

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Shipments</h1>
          <p className="text-gray-500 text-sm mt-1">Track all Shiprocket shipments</p>
        </div>
        <button onClick={handleSync} disabled={syncing} className="admin-btn">
          <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing...' : 'Sync All Tracking'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Shipments', value: total, color: 'bg-blue-50 text-blue-700' },
          { label: 'Delivered', value: delivered, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'In Transit', value: inTransit, color: 'bg-indigo-50 text-indigo-700' },
          { label: 'Processing', value: pending, color: 'bg-amber-50 text-amber-700' },
        ].map(stat => (
          <div key={stat.label} className="admin-card p-4">
            <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            <p className={`text-2xl font-black mt-1 ${stat.color.split(' ')[1]}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {result && (
        <div className={`mb-4 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium ${result.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {result.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {result.message}
          <button onClick={() => setResult(null)} className="ml-auto"><XCircle size={16} /></button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name, AWB, order ID..." value={search} onChange={e => setSearch(e.target.value)}
            className="admin-input !pl-9" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="admin-input !w-auto">
          <option value="">All Statuses</option>
          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">AWB</th>
                <th className="px-4 py-3">Courier</th>
                <th className="px-4 py-3">Delivery Status</th>
                <th className="px-4 py-3">Shipped</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No shipments found.</td></tr>
              ) : filtered.map(order => (
                <tr key={order.id} className="border-b hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{order.id?.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm">{order.user_name}</div>
                    <div className="text-xs text-gray-400">{order.user_phone}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm font-medium">{order.awb_code || <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3 text-sm">{order.courier_name || <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${deliveryBadge(order.delivery_status || order.shipment_status)}`}>
                      {order.delivery_status || order.shipment_status || 'Processing'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{order.shipped_at ? new Date(order.shipped_at).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {order.tracking_url && (
                        <a href={order.tracking_url} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600" title="Open Tracking">
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {(order.awb_code || order.shipment_id) && (
                        <button onClick={() => handleTrack(order)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title="Live Status">
                          <Truck size={14} />
                        </button>
                      )}
                      {!order.awb_code && order.shipment_id && (
                        <button onClick={() => handleRequestAwb(order)} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600" title="Request AWB">
                          <Package size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tracking Modal */}
      {trackingModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setTrackingModal(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Live Tracking</h3>
              <button onClick={() => setTrackingModal(null)}><XCircle size={20} className="text-gray-400" /></button>
            </div>
            {trackingModal.data?.current_status && (
              <div className="mb-4 p-3 rounded-lg bg-blue-50">
                <p className="text-sm font-semibold text-blue-700">Current: {trackingModal.data.current_status}</p>
              </div>
            )}
            {trackingModal.data?.activities?.length > 0 ? (
              <div className="space-y-3">
                {trackingModal.data.activities.slice(0, 15).map((act: any, i: number) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{act.activity || act['sr-status-label'] || act.status || 'Update'}</p>
                      <p className="text-xs text-gray-400">{act.date || ''} — {act.location || ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No tracking activities yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
