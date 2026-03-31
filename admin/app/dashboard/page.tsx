'use client';
import { useEffect, useState } from 'react';
import { ShoppingBag, DollarSign, Package, TrendingUp } from 'lucide-react';
import { getOrderStats } from '@/lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderStats().then((res) => setStats(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Orders', value: stats?.totalOrders ?? '—', icon: ShoppingBag, color: 'bg-blue-500' },
    { label: 'Paid Orders', value: stats?.paidOrders ?? '—', icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Total Revenue', value: stats ? `₹${stats.revenue.toLocaleString()}` : '—', icon: DollarSign, color: 'bg-primary' },
    { label: 'Recent (24h)', value: stats?.recentOrders?.length ?? '—', icon: Package, color: 'bg-orange-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, Admin. Here's what's happening with Grainzz.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="admin-card p-5 flex items-center gap-4">
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
              <Icon size={22} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-xl font-black text-gray-900">
                {loading ? <span className="block w-12 h-6 bg-gray-100 rounded animate-pulse" /> : value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="admin-card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-sm text-primary font-medium hover:underline">View All</Link>
        </div>
        {loading ? (
          <div className="px-6 py-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : !stats?.recentOrders?.length ? (
          <div className="px-6 py-8 text-center text-gray-400 text-sm">No orders yet. Orders will appear here once customers start placing them.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-6 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentOrders.map((order: any) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">{order._id.slice(-8)}</td>
                    <td className="px-6 py-4 text-sm font-medium">{order.userDetails?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm font-bold">₹{order.totalAmount}</td>
                    <td className="px-6 py-4">
                      <span className={`admin-badge-${order.status}`}>{order.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
