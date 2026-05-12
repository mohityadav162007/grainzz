'use client';
import { useEffect, useState } from 'react';
import { ShoppingBag, DollarSign, Package } from 'lucide-react';
import { getOrderStats, getProducts } from '@/lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getOrderStats().then((res) => setStats(res.data)).catch(() => {}),
      getProducts().then((res) => setTotalProducts(res.data.length)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Orders', value: stats?.totalOrders ?? 0, icon: ShoppingBag, color: 'bg-blue-500' },
    { label: 'Total Revenue', value: stats?.revenue ? `₹${Number(stats.revenue).toLocaleString()}` : '₹0', icon: DollarSign, color: 'bg-primary' },
    { label: 'Total Products', value: totalProducts, icon: Package, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, Admin. Here&apos;s what&apos;s happening with Grainzz.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="admin-card p-5 flex items-center gap-4">
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
              <Icon size={22} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">{label}</p>
              {loading ? (
                <div className="w-20 h-7 bg-gray-100 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-xl font-black text-gray-900">{value}</p>
              )}
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
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-100 animate-pulse rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-100 animate-pulse rounded" /></td>
                  </tr>
                ))
              ) : !stats?.recentOrders?.length ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No orders yet. Orders will appear here once customers start placing them.
                  </td>
                </tr>
              ) : (
                stats.recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">{order.id?.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-sm font-medium">{order.user_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm font-bold">₹{order.total_amount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'paid' ? 'bg-green-100 text-green-700' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'delivered' ? 'bg-purple-100 text-purple-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{order.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('en-IN')}
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
