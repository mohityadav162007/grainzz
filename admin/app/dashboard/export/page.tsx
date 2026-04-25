'use client';
import { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, DollarSign, ShoppingBag, Package, Users, Eye,
  Download, FileJson, FileSpreadsheet, Loader2, AlertTriangle,
  BarChart3, Activity, Tag, Percent,
} from 'lucide-react';
import { getAnalyticsData, exportData } from '@/lib/api';

const COLORS = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#e11d48', '#4f46e5'];
const STATUS_COLORS: Record<string, string> = {
  pending: '#eab308', paid: '#16a34a', processing: '#2563eb', shipped: '#7c3aed',
  delivered: '#059669', cancelled: '#dc2626', failed: '#ef4444', refunded: '#f97316',
};

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'revenue', label: 'Revenue', icon: DollarSign },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'export', label: 'Export Data', icon: Download },
];

const exportTables = [
  { id: 'products', label: 'Products', icon: '📦' },
  { id: 'orders', label: 'Orders', icon: '🛒' },
  { id: 'order_items', label: 'Order Items', icon: '📋' },
  { id: 'coupons', label: 'Coupons', icon: '🏷️' },
  { id: 'offers', label: 'Offers', icon: '⭐' },
  { id: 'user_roles', label: 'Users', icon: '👤' },
];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    getAnalyticsData()
      .then(setData)
      .catch((err) => console.error('Analytics error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async (table: string, format: 'csv' | 'json') => {
    setExporting(`${table}-${format}`);
    try {
      const result = await exportData(table, format);
      const blob = new Blob([result], { type: format === 'csv' ? 'text/csv' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grainzz-${table}-${new Date().toISOString().slice(0, 10)}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 size={36} className="animate-spin text-primary mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Analytics & Insights</h1>
        <p className="text-gray-500 text-sm mt-1">
          Comprehensive data analytics for Grainzz — Last updated: {new Date().toLocaleString('en-IN')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: `₹${kpis.totalRevenue?.toLocaleString()}`, icon: DollarSign, color: 'bg-green-500', sub: `${kpis.paidOrders} paid orders` },
              { label: 'Total Orders', value: kpis.totalOrders, icon: ShoppingBag, color: 'bg-blue-500', sub: `Avg ₹${kpis.avgOrderValue?.toLocaleString()}` },
              { label: 'Products', value: `${kpis.activeProducts}/${kpis.totalProducts}`, icon: Package, color: 'bg-orange-500', sub: 'Active / Total' },
              { label: 'Users', value: kpis.usersCount, icon: Users, color: 'bg-purple-500', sub: `${kpis.totalViews?.toLocaleString()} page views` },
            ].map(({ label, value, icon: Icon, color, sub }) => (
              <div key={label} className="admin-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
                <p className="text-2xl font-black text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{sub}</p>
              </div>
            ))}
          </div>

          {/* Revenue Trend + Order Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="admin-card p-6 lg:col-span-2">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity size={18} className="text-green-600" /> Revenue Trend
              </h3>
              {data?.revenueTimeline?.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={data.revenueTimeline}>
                    <defs>
                      <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#16a34a" fill="url(#revGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">No revenue data yet</div>
              )}
            </div>

            <div className="admin-card p-6">
              <h3 className="font-bold text-gray-900 mb-4">Order Status</h3>
              {data?.orderStatusDistribution?.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={data.orderStatusDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                        {data.orderStatusDistribution.map((entry: any, i: number) => (
                          <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {data.orderStatusDistribution.map((entry: any, i: number) => (
                      <div key={entry.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: STATUS_COLORS[entry.name] || COLORS[i] }} />
                          <span className="capitalize text-gray-600">{entry.name}</span>
                        </div>
                        <span className="font-bold text-gray-900">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No orders yet</div>
              )}
            </div>
          </div>

          {/* Category Breakdown + Low Stock */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="admin-card p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Tag size={18} className="text-blue-600" /> Category Breakdown
              </h3>
              {data?.categoryBreakdown?.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.categoryBreakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip />
                    <Bar dataKey="products" fill="#2563eb" name="Products" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">No products yet</div>
              )}
            </div>

            <div className="admin-card p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-500" /> Low Stock Alerts
              </h3>
              {data?.lowStockProducts?.length > 0 ? (
                <div className="space-y-3 max-h-[250px] overflow-y-auto">
                  {data.lowStockProducts.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.category}</p>
                      </div>
                      <span className={`text-sm font-black ${p.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                        {p.stock === 0 ? 'OUT OF STOCK' : `${p.stock} left`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-green-500 text-sm font-medium">
                  ✅ All products are well stocked
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          {/* Revenue KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: `₹${kpis.totalRevenue?.toLocaleString()}`, color: 'text-green-600' },
              { label: 'Avg Order Value', value: `₹${kpis.avgOrderValue?.toLocaleString()}`, color: 'text-blue-600' },
              { label: 'Total Discounts Given', value: `₹${kpis.totalDiscount?.toLocaleString()}`, color: 'text-red-600' },
              { label: 'Active Coupons', value: kpis.activeCoupons, color: 'text-purple-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="admin-card p-5 text-center">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={`text-2xl font-black ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Monthly Revenue Bar Chart */}
          <div className="admin-card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Monthly Revenue & Orders</h3>
            {data?.revenueTimeline?.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data.revenueTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number, name: string) => [name === 'revenue' ? `₹${v.toLocaleString()}` : v, name === 'revenue' ? 'Revenue' : 'Orders']} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="#16a34a" name="Revenue" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="orders" fill="#2563eb" name="Orders" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-gray-400 text-sm">No revenue data yet</div>
            )}
          </div>

          {/* Daily Trend */}
          <div className="admin-card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Daily Revenue (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.dailyTimeline || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={2} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Revenue Pie */}
          <div className="admin-card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Revenue by Category</h3>
            {data?.categoryBreakdown?.filter((c: any) => c.revenue > 0).length > 0 ? (
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={data.categoryBreakdown.filter((c: any) => c.revenue > 0)}
                      cx="50%" cy="50%" outerRadius={100} paddingAngle={3} dataKey="revenue"
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.categoryBreakdown.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">No category revenue data yet</div>
            )}
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Product KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Products', value: kpis.totalProducts, icon: Package, color: 'bg-blue-500' },
              { label: 'Active Products', value: kpis.activeProducts, icon: Package, color: 'bg-green-500' },
              { label: 'Total Views', value: kpis.totalViews?.toLocaleString(), icon: Eye, color: 'bg-purple-500' },
              { label: 'Active Offers', value: kpis.activeOffers, icon: Percent, color: 'bg-orange-500' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="admin-card p-5 flex items-center gap-3">
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
                  <Icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-xl font-black text-gray-900">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Top Products by Views */}
          <div className="admin-card p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Eye size={18} className="text-purple-600" /> Top Products by Views
            </h3>
            {data?.topProductsByViews?.filter((p: any) => p.views > 0).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.topProductsByViews.filter((p: any) => p.views > 0)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={150} />
                  <Tooltip />
                  <Bar dataKey="views" fill="#7c3aed" name="Views" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">No product views yet</div>
            )}
          </div>

          {/* Top Products by Revenue */}
          <div className="admin-card p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-green-600" /> Top Products by Revenue
            </h3>
            {data?.topProductsByRevenue?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['#', 'Product', 'Revenue', 'Units Sold'].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.topProductsByRevenue.map((p: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-bold text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{p.name}</td>
                        <td className="px-4 py-3 text-sm font-bold text-green-600">₹{p.revenue.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{p.sold}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No sales data yet</div>
            )}
          </div>

          {/* Category Distribution */}
          <div className="admin-card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Products by Category</h3>
            {data?.categoryBreakdown?.length > 0 ? (
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={data.categoryBreakdown} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="products"
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {data.categoryBreakdown.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">No products yet</div>
            )}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Order KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Orders', value: kpis.totalOrders, color: 'text-blue-600' },
              { label: 'Paid Orders', value: kpis.paidOrders, color: 'text-green-600' },
              { label: 'Avg Order Value', value: `₹${kpis.avgOrderValue?.toLocaleString()}`, color: 'text-purple-600' },
              { label: 'Conversion Rate', value: kpis.totalOrders > 0 ? `${((kpis.paidOrders / kpis.totalOrders) * 100).toFixed(1)}%` : '0%', color: 'text-orange-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="admin-card p-5 text-center">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={`text-2xl font-black ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Daily Orders Line Chart */}
          <div className="admin-card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Daily Orders (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data?.dailyTimeline || []}>
                <defs>
                  <linearGradient id="ordGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={2} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#2563eb" fill="url(#ordGradient)" strokeWidth={2} name="Orders" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status + Payment Status Pie Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="admin-card p-6">
              <h3 className="font-bold text-gray-900 mb-4">Order Status Distribution</h3>
              {data?.orderStatusDistribution?.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={data.orderStatusDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value"
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {data.orderStatusDistribution.map((entry: any, i: number) => (
                          <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">No orders yet</div>
              )}
            </div>

            <div className="admin-card p-6">
              <h3 className="font-bold text-gray-900 mb-4">Payment Status Distribution</h3>
              {data?.paymentStatusDistribution?.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={data.paymentStatusDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value"
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {data.paymentStatusDistribution.map((entry: any, i: number) => (
                          <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">No orders yet</div>
              )}
            </div>
          </div>

          {/* Coupon Usage */}
          <div className="admin-card p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Tag size={18} className="text-purple-600" /> Coupon Performance
            </h3>
            {data?.couponUsage?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Code', 'Type', 'Value', 'Used', 'Limit', 'Status'].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.couponUsage.map((c: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono font-bold text-gray-900">{c.code}</td>
                        <td className="px-4 py-3 text-sm capitalize text-gray-600">{c.type}</td>
                        <td className="px-4 py-3 text-sm font-semibold">{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</td>
                        <td className="px-4 py-3 text-sm font-bold text-blue-600">{c.used}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{c.limit || '∞'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {c.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-[150px] flex items-center justify-center text-gray-400 text-sm">No coupons created yet</div>
            )}
          </div>
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="admin-card p-6">
            <h3 className="font-bold text-gray-900 mb-1">Download Database</h3>
            <p className="text-sm text-gray-500 mb-6">Export your entire database as CSV or JSON files for external analysis.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exportTables.map(({ id, label, icon }) => (
                <div key={id} className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors">
                  <div className="text-3xl mb-3">{icon}</div>
                  <h4 className="font-bold text-gray-900 mb-1">{label}</h4>
                  <p className="text-xs text-gray-500 mb-4">Export all {label.toLowerCase()} data</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExport(id, 'csv')}
                      disabled={exporting === `${id}-csv`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      {exporting === `${id}-csv` ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
                      CSV
                    </button>
                    <button
                      onClick={() => handleExport(id, 'json')}
                      disabled={exporting === `${id}-json`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                      {exporting === `${id}-json` ? <Loader2 size={14} className="animate-spin" /> : <FileJson size={14} />}
                      JSON
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
