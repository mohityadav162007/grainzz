'use client';
import { useState, useEffect, useCallback } from 'react';
import { getOrders, updateOrder, sendOrdersToShiprocket, syncAllTrackingStatuses, trackShipment } from '@/lib/api';
import { ChevronDown, Truck, RefreshCw, ExternalLink, Package, CheckCircle2, AlertTriangle, XCircle, Clock, Send } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-red-100 text-red-700',
};

const shipmentBadge = (status: string) => {
  if (!status) return 'bg-gray-100 text-gray-500';
  const s = status.toLowerCase();
  if (s.includes('deliver')) return 'bg-emerald-100 text-emerald-700';
  if (s.includes('transit') || s.includes('shipped')) return 'bg-blue-100 text-blue-700';
  if (s.includes('out for')) return 'bg-amber-100 text-amber-700';
  if (s.includes('cancel') || s.includes('rto')) return 'bg-red-100 text-red-700';
  return 'bg-sky-100 text-sky-700';
};

const statuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [actionResult, setActionResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [trackingModal, setTrackingModal] = useState<{ orderId: string; data: any } | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filter) params.status = filter;
      const res = await getOrders(params);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Auto-clear action result after 6s
  useEffect(() => {
    if (actionResult) {
      const t = setTimeout(() => setActionResult(null), 6000);
      return () => clearTimeout(t);
    }
  }, [actionResult]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrder(orderId, { status: newStatus });
      fetchOrders();
    } catch { alert('Failed to update order status'); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const eligible = orders.filter(o => !o.is_sent_to_shiprocket && o.payment_status === 'paid');
    if (selectedIds.size === eligible.length && eligible.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(eligible.map(o => o.id)));
    }
  };

  const handleSendToShiprocket = async () => {
    if (selectedIds.size === 0) return;
    setSending(true);
    setActionResult(null);
    try {
      const result = await sendOrdersToShiprocket(Array.from(selectedIds));
      const msgs: string[] = [];
      if (result.shipped > 0) msgs.push(`${result.shipped} order(s) sent successfully`);
      if (result.failed > 0) {
        const errDetails = result.errors?.map((e: any) => `${e.orderId?.slice(0, 8)}: ${e.error}`).join('; ');
        msgs.push(`${result.failed} failed: ${errDetails}`);
      }
      setActionResult({
        type: result.failed > 0 && result.shipped === 0 ? 'error' : 'success',
        message: msgs.join(' | '),
      });
      setSelectedIds(new Set());
      fetchOrders();
    } catch (err: any) {
      setActionResult({ type: 'error', message: err.message || 'Failed to send orders' });
    } finally {
      setSending(false);
    }
  };

  const handleSyncTracking = async () => {
    setSyncing(true);
    try {
      const result = await syncAllTrackingStatuses();
      setActionResult({ type: 'success', message: `Tracking synced — ${result.updated || 0} orders updated` });
      fetchOrders();
    } catch (err: any) {
      setActionResult({ type: 'error', message: err.message || 'Sync failed' });
    } finally {
      setSyncing(false);
    }
  };

  const handleTrackOrder = async (order: any) => {
    try {
      const result = await trackShipment({
        awbCode: order.awb_code || undefined,
        shipmentId: order.shipment_id || undefined,
      });
      setTrackingModal({ orderId: order.id, data: result.tracking });
    } catch (err: any) {
      setActionResult({ type: 'error', message: `Tracking failed: ${err.message}` });
    }
  };

  const eligibleCount = orders.filter(o => !o.is_sent_to_shiprocket && o.payment_status === 'paid').length;

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Orders & Shipments</h1>
          <p className="text-gray-500 text-sm mt-1">Manage orders and Shiprocket shipments</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleSyncTracking} disabled={syncing}
            className="admin-btn-outline !text-xs !px-3 !py-1.5">
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync Tracking'}
          </button>
        </div>
      </div>

      {/* Action Result Banner */}
      {actionResult && (
        <div className={`mb-4 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium animate-in ${
          actionResult.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {actionResult.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {actionResult.message}
          <button onClick={() => setActionResult(null)} className="ml-auto text-current opacity-50 hover:opacity-100">
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-primary">{selectedIds.size} order(s) selected</span>
          <button onClick={handleSendToShiprocket} disabled={sending}
            className="admin-btn !text-xs !px-3 !py-1.5 !bg-indigo-600 hover:!bg-indigo-700">
            <Send size={14} />
            {sending ? 'Sending...' : 'Send to Shiprocket'}
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="text-xs text-gray-500 hover:text-gray-700 font-medium">
            Clear Selection
          </button>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setFilter('')} className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${!filter ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          All
        </button>
        {statuses.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 text-sm rounded-lg font-medium capitalize transition-colors ${filter === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
              <tr>
                <th className="px-4 py-4 w-10">
                  <input type="checkbox" checked={selectedIds.size === eligibleCount && eligibleCount > 0}
                    onChange={toggleSelectAll} className="rounded border-gray-300 text-primary focus:ring-primary" />
                </th>
                <th className="px-4 py-4">Order ID</th>
                <th className="px-4 py-4">Customer</th>
                <th className="px-4 py-4">Amount</th>
                <th className="px-4 py-4">Payment</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Shiprocket</th>
                <th className="px-4 py-4">Shipment</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="px-6 py-8 text-center text-gray-500">Loading orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={10} className="px-6 py-8 text-center text-gray-500">No orders found.</td></tr>
              ) : (
                orders.map((order) => (
                  <>
                    <tr key={order.id} className="border-b hover:bg-gray-50/50">
                      <td className="px-4 py-4">
                        {!order.is_sent_to_shiprocket && order.payment_status === 'paid' ? (
                          <input type="checkbox" checked={selectedIds.has(order.id)}
                            onChange={() => toggleSelect(order.id)}
                            className="rounded border-gray-300 text-primary focus:ring-primary" />
                        ) : (
                          <span className="w-4 h-4 block" />
                        )}
                      </td>
                      <td className="px-4 py-4 font-mono text-gray-500 cursor-pointer" onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                        {order.id?.slice(0, 8)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium">{order.user_name}</div>
                        <div className="text-xs text-gray-400">{order.user_phone}</div>
                      </td>
                      <td className="px-4 py-4 font-bold">₹{order.total_amount}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : order.payment_status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <select value={order.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`px-2 py-1 rounded-lg text-xs font-semibold border-0 cursor-pointer ${statusColors[order.status] || 'bg-gray-100'}`}>
                          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        {order.is_sent_to_shiprocket ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            <CheckCircle2 size={12} /> Sent
                          </span>
                        ) : order.payment_status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                            <Clock size={12} /> Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                            — Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {order.delivery_status ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${shipmentBadge(order.delivery_status)}`}>
                            {order.delivery_status}
                          </span>
                        ) : order.shipment_status ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${shipmentBadge(order.shipment_status)}`}>
                            {order.shipment_status}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-gray-400 text-xs">{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-4">
                        <button onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                          <ChevronDown size={16} className={`transition-transform ${expandedId === order.id ? 'rotate-180' : ''}`} />
                        </button>
                      </td>
                    </tr>
                    {expandedId === order.id && (
                      <tr key={`${order.id}-details`}>
                        <td colSpan={10} className="px-6 py-5 bg-gray-50/80 border-b">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                            {/* Customer Details */}
                            <div>
                              <p className="font-semibold text-gray-700 mb-2">Customer Details</p>
                              <p>{order.user_name}</p>
                              <p className="text-gray-500">{order.user_phone}</p>
                              <p className="text-gray-500">{order.user_email}</p>
                              <p className="text-gray-500 mt-1">{order.user_address}, {order.user_city} {order.user_state} {order.user_pincode}</p>
                            </div>
                            {/* Order Items */}
                            <div>
                              <p className="font-semibold text-gray-700 mb-2">Order Items</p>
                              {order.order_items?.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between py-1 border-b border-gray-200 last:border-0">
                                  <span>{item.name} x{item.quantity}</span>
                                  <span className="font-medium">₹{item.price * item.quantity}</span>
                                </div>
                              ))}
                              <div className="flex justify-between pt-2 font-bold">
                                <span>Total</span>
                                <span>₹{order.total_amount}</span>
                              </div>
                              {order.coupon_code && (
                                <div className="text-xs text-green-600 mt-1">Coupon: {order.coupon_code} (-₹{order.discount_amount})</div>
                              )}
                            </div>
                            {/* Shipment Details */}
                            <div>
                              <p className="font-semibold text-gray-700 mb-2">Shipment Details</p>
                              {order.is_sent_to_shiprocket ? (
                                <div className="space-y-2">
                                  {order.shiprocket_order_id && (
                                    <div className="flex justify-between"><span className="text-gray-500">SR Order ID</span><span className="font-mono">{order.shiprocket_order_id}</span></div>
                                  )}
                                  {order.awb_code && (
                                    <div className="flex justify-between"><span className="text-gray-500">AWB</span><span className="font-mono font-medium">{order.awb_code}</span></div>
                                  )}
                                  {order.courier_name && (
                                    <div className="flex justify-between"><span className="text-gray-500">Courier</span><span>{order.courier_name}</span></div>
                                  )}
                                  {order.delivery_status && (
                                    <div className="flex justify-between"><span className="text-gray-500">Status</span>
                                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${shipmentBadge(order.delivery_status)}`}>{order.delivery_status}</span>
                                    </div>
                                  )}
                                  {order.shipped_at && (
                                    <div className="flex justify-between"><span className="text-gray-500">Shipped</span><span>{new Date(order.shipped_at).toLocaleDateString('en-IN')}</span></div>
                                  )}
                                  <div className="flex gap-2 mt-3">
                                    {order.tracking_url && (
                                      <a href={order.tracking_url} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors">
                                        <ExternalLink size={12} /> Track Shipment
                                      </a>
                                    )}
                                    {(order.awb_code || order.shipment_id) && (
                                      <button onClick={() => handleTrackOrder(order)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                                        <Truck size={12} /> Live Status
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-gray-400 text-sm flex items-center gap-2">
                                  <Package size={16} />
                                  {order.payment_status === 'paid' ? 'Ready to ship — select and send to Shiprocket' : 'Awaiting payment confirmation'}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
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
              <button onClick={() => setTrackingModal(null)} className="text-gray-400 hover:text-gray-600"><XCircle size={20} /></button>
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
                      <p className="text-xs text-gray-400">{act.date || act.timestamp || ''} — {act.location || ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No tracking activities available yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
