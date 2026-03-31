'use client';
import { useState, useEffect } from 'react';
import { getOrders, updateOrder } from '@/lib/api';
import { Check, Loader2, X } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [updatingStr, setUpdatingStr] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getOrders(filter ? { status: filter } : undefined);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const handleUpdateStatus = async (id: string, currentStatus: string, currentPayment: string) => {
    const newStatus = prompt('Enter new status (pending, paid, processing, shipped, delivered, cancelled):', currentStatus);
    if (!newStatus || newStatus === currentStatus) return;
    
    setUpdatingStr(id);
    try {
      await updateOrder(id, { status: newStatus.toLowerCase() });
      await fetchOrders();
    } catch (err) {
      alert('Failed to update order status');
    } finally {
      setUpdatingStr('');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and track customer orders</p>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-2 overflow-x-auto">
          {['', 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${filter === f ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'}`}
            >
              {f ? f.charAt(0).toUpperCase() + f.slice(1) : 'All Orders'}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
              <tr>
                <th className="px-6 py-4">Order Details</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status & Payment</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No orders found.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="font-mono text-gray-900 font-medium">#{order._id.slice(-8)}</div>
                      <div className="text-gray-400 text-xs mt-1">{new Date(order.createdAt).toLocaleString('en-IN')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{order.userDetails.name}</div>
                      <div className="text-gray-500 text-xs mt-1">{order.userDetails.phone}</div>
                      <div className="text-gray-400 text-xs mt-0.5 max-w-[200px] truncate" title={order.userDetails.address}>
                        {order.userDetails.city}, {order.userDetails.state}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-500">{order.items.length} items</div>
                      <div className="text-xs text-gray-400 line-clamp-2 max-w-[200px] mt-1">
                        {order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">₹{order.totalAmount}</div>
                      {order.couponCode && (
                        <div className="text-xs text-green-600 font-medium mt-1 inline-flex bg-green-50 px-2 rounded-full border border-green-100">
                          {order.couponCode} (-₹{order.discountAmount})
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 space-y-2">
                       <div><span className={`admin-badge-${order.status}`}>{order.status}</span></div>
                       <div>
                         <span className={`text-xs font-semibold px-2 py-1 rounded truncate max-w-[120px] inline-block ${order.paymentStatus === 'paid' ? 'text-green-700 bg-green-50' : order.paymentStatus === 'failed' ? 'text-red-700 bg-red-50' : 'text-yellow-700 bg-yellow-50'}`}>
                           Pay: {order.paymentStatus}
                         </span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleUpdateStatus(order._id, order.status, order.paymentStatus)}
                        disabled={updatingStr === order._id}
                        className="admin-btn-outline py-1.5 px-3 whitespace-nowrap inline-flex"
                      >
                        {updatingStr === order._id ? <Loader2 size={14} className="animate-spin" /> : 'Update Status'}
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
