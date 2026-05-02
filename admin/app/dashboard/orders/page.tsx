'use client';
import { useState, useEffect } from 'react';
import { getOrders, updateOrder } from '@/lib/api';
import { Search, ChevronDown } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = async () => {
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
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      if (newStatus === 'shipped') {
        const link = window.prompt("Please enter the tracking link for this shipment:");
        if (link === null) return; // User cancelled
        await updateOrder(orderId, { status: newStatus, tracking_link: link });
      } else {
        await updateOrder(orderId, { status: newStatus });
      }
      fetchOrders();
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">Manage customer orders</p>
      </div>

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
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No orders found.</td></tr>
              ) : (
                orders.map((order) => (
                  <>
                    <tr key={order.id} className="border-b hover:bg-gray-50/50 cursor-pointer" onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                      <td className="px-6 py-4 font-mono text-gray-500">{order.id?.slice(0, 8)}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{order.user_name}</div>
                        <div className="text-xs text-gray-400">{order.user_phone}</div>
                      </td>
                      <td className="px-6 py-4 font-bold">₹{order.total_amount}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`px-2 py-1 rounded-lg text-xs font-semibold border-0 cursor-pointer ${statusColors[order.status] || 'bg-gray-100'}`}
                        >
                          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <ChevronDown size={16} className={`transition-transform ${expandedId === order.id ? 'rotate-180' : ''}`} />
                      </td>
                    </tr>
                    {expandedId === order.id && (
                      <tr key={`${order.id}-details`}>
                        <td colSpan={7} className="px-6 py-4 bg-gray-50">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-semibold text-gray-700 mb-1">Customer Details</p>
                              <p>{order.user_name}</p>
                              <p>{order.user_phone}</p>
                              <p>{order.user_email}</p>
                              <p>{order.user_address}, {order.user_city} {order.user_state} {order.user_pincode}</p>
                              {order.tracking_link && (
                                <div className="mt-4">
                                  <p className="font-semibold text-gray-700 mb-1">Tracking Link</p>
                                  <a href={order.tracking_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                                    {order.tracking_link}
                                  </a>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700 mb-1">Order Items</p>
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
    </div>
  );
}
