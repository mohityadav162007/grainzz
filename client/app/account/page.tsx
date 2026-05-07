'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, User, MapPin, Package, Settings, LogOut, PackageOpen, ExternalLink, Truck } from 'lucide-react';
import { getUserOrders } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

type Tab = 'profile' | 'orders' | 'addresses' | 'settings';

export default function AccountPage() {
  const { user, loading, signOut, setAuthModalOpen } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  useEffect(() => {
    if (!loading && !user) {
      setAuthModalOpen(true);
      router.push('/');
    }
  }, [user, loading, router, setAuthModalOpen]);

  if (loading) {
    return (
      <div className="bg-[#FCF9F2] min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-brand-green font-bold text-[20px]">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-[#FCF9F2] min-h-screen pb-[100px]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[120px] pt-[32px]">
        {/* Breadcrumb */}
        <div className="flex items-center gap-[8px] text-[13px] md:text-[14px] font-semibold text-[#8E8E8E] mb-[24px] tracking-wide">
          <Link href="/" className="hover:text-brand-green transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-brand-black">My Account</span>
        </div>

        <h1 className="text-[32px] md:text-[45px] font-bold text-brand-black font-brand tracking-tight mb-[40px]">
          My <span className="text-brand-red">Account</span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-[32px]">
          {/* Sidebar */}
          <div className="w-full lg:w-[280px] flex-shrink-0 bg-white rounded-[20px] border border-[#EAEAEA] shadow-sm p-6 flex flex-col gap-2 h-fit">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#EAEAEA]">
               <div className="w-[50px] h-[50px] bg-brand-green text-white rounded-full flex items-center justify-center font-bold text-[20px]">
                 {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
               </div>
               <div className="overflow-hidden">
                  <h3 className="font-bold text-brand-black text-[18px] truncate">{user.user_metadata?.full_name || 'User'}</h3>
                  <p className="text-[13px] font-medium text-[#7A7A7A] truncate">{user.email}</p>
               </div>
            </div>
            
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'profile' ? 'bg-brand-light text-brand-green' : 'hover:bg-[#F2F2F2] text-brand-black'}`}
            >
               <User size={20} strokeWidth={2.5}/>
               <span>Profile Details</span>
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'orders' ? 'bg-brand-light text-brand-green' : 'hover:bg-[#F2F2F2] text-brand-black'}`}
            >
               <Package size={20} strokeWidth={2.5}/>
               <span>My Orders</span>
            </button>
            <button 
              onClick={() => setActiveTab('addresses')}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'addresses' ? 'bg-brand-light text-brand-green' : 'hover:bg-[#F2F2F2] text-brand-black'}`}
            >
               <MapPin size={20} strokeWidth={2.5}/>
               <span>Saved Addresses</span>
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'settings' ? 'bg-brand-light text-brand-green' : 'hover:bg-[#F2F2F2] text-brand-black'}`}
            >
               <Settings size={20} strokeWidth={2.5}/>
               <span>Account Settings</span>
            </button>
            <div className="mt-4 pt-4 border-t border-[#EAEAEA]">
              <button 
                onClick={() => { signOut(); router.push('/'); }}
                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl hover:bg-[#FFF0F0] text-brand-red font-bold transition-colors"
              >
                 <LogOut size={20} strokeWidth={2.5}/>
                 <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Main Content Pane */}
          <div className="flex-1 bg-white rounded-[20px] border border-[#EAEAEA] shadow-sm p-[32px] md:p-[48px] min-h-[400px]">
            {activeTab === 'profile' && (
              <div className="animate-fade-in">
                <h2 className="text-[24px] font-bold text-brand-black mb-[32px]">Profile Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] max-w-[600px]">
                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-semibold text-[#888888]">Full Name</label>
                    <div className="px-4 py-3 rounded-xl border border-[#EAEAEA] bg-[#FAFAFA] font-medium text-brand-black">{user.user_metadata?.full_name || 'Not provided'}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-semibold text-[#888888]">Email Address</label>
                    <div className="px-4 py-3 rounded-xl border border-[#EAEAEA] bg-[#FAFAFA] font-medium text-brand-black">{user.email}</div>
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-[14px] font-semibold text-[#888888]">Phone Number</label>
                    <div className="px-4 py-3 rounded-xl border border-[#EAEAEA] bg-[#FAFAFA] font-medium text-brand-black">{user.phone || 'Not provided'}</div>
                  </div>
                </div>
                
                <button className="mt-[40px] bg-brand-black hover:bg-[#1A1A1A] text-white px-[32px] py-[12px] rounded-full font-bold text-[15px] transition-colors">
                  Edit Details
                </button>
              </div>
            )}

            {activeTab === 'orders' && (
              <OrdersTab userEmail={user.email || ''} />
            )}

            {activeTab === 'addresses' && (
              <div className="animate-fade-in flex flex-col items-center justify-center text-center h-full pt-10">
                <div className="w-[80px] h-[80px] bg-[#F5F5F5] rounded-full flex items-center justify-center mb-6">
                  <MapPin size={40} className="text-[#CCCCCC]" strokeWidth={1.5} />
                </div>
                <h3 className="text-[22px] font-bold text-brand-black mb-2">No addresses saved</h3>
                <p className="text-[15px] text-[#7A7A7A] mb-8 max-w-[300px]">Add your shipping addresses here for a faster checkout experience.</p>
                <button className="bg-brand-black hover:bg-[#1A1A1A] text-white px-[32px] py-[12px] rounded-full font-bold text-[15px] transition-colors">
                  Add New Address
                </button>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="animate-fade-in">
                <h2 className="text-[24px] font-bold text-brand-black mb-[32px]">Account Settings</h2>
                <div className="space-y-6 max-w-[500px]">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-[#EAEAEA] hover:border-[#D0D0D0] transition-colors cursor-pointer group">
                    <div>
                      <h4 className="font-bold text-brand-black text-[15px]">Change Password</h4>
                      <p className="text-[13px] text-[#888888] font-medium pt-0.5">Update your login credentials securely.</p>
                    </div>
                    <ChevronRight size={18} className="text-[#888888] group-hover:text-brand-black transition-colors" />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-[#EAEAEA] hover:border-[#D0D0D0] transition-colors cursor-pointer group">
                    <div>
                      <h4 className="font-bold text-brand-black text-[15px]">Notification Preferences</h4>
                      <p className="text-[13px] text-[#888888] font-medium pt-0.5">Manage your email alerts and SMS.</p>
                    </div>
                    <ChevronRight size={18} className="text-[#888888] group-hover:text-brand-black transition-colors" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Orders Sub-Component ────────────────────────────────────────────────────

const TRACKING_STEPS = ['Processing', 'Shipped', 'In Transit', 'Out For Delivery', 'Delivered'];

function getStepIndex(status: string): number {
  if (!status) return 0;
  const s = status.toLowerCase();
  if (s.includes('deliver') && !s.includes('out')) return 4;
  if (s.includes('out for')) return 3;
  if (s.includes('transit')) return 2;
  if (s.includes('shipped')) return 1;
  return 0;
}

function OrdersTab({ userEmail }: { userEmail: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!userEmail) return;
    setLoading(true);
    getUserOrders(userEmail)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [userEmail]);

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center py-16">
        <div className="animate-pulse text-brand-green font-bold">Loading orders...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center text-center h-full pt-10">
        <div className="w-[80px] h-[80px] bg-[#F5F5F5] rounded-full flex items-center justify-center mb-6">
          <PackageOpen size={40} className="text-[#CCCCCC]" strokeWidth={1.5} />
        </div>
        <h3 className="text-[22px] font-bold text-brand-black mb-2">No orders placed</h3>
        <p className="text-[15px] text-[#7A7A7A] mb-8 max-w-[300px]">Your future orders will appear here.</p>
        <Link href="/products" className="bg-brand-green hover:bg-[#1E8A38] text-white px-[32px] py-[12px] rounded-full font-bold text-[15px] transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      <h2 className="text-[24px] font-bold text-brand-black mb-4">My Orders</h2>
      {orders.map(order => {
        const isExpanded = expandedId === order.id;
        const stepIdx = getStepIndex(order.delivery_status || (order.status === 'delivered' ? 'Delivered' : order.status === 'shipped' ? 'Shipped' : ''));

        return (
          <div key={order.id} className="border border-[#EAEAEA] rounded-[16px] overflow-hidden transition-all">
            <button
              onClick={() => setExpandedId(isExpanded ? null : order.id)}
              className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-[#FAFAFA] transition-colors text-left"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-[13px] text-[#888]">#{order.id?.slice(0, 8)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    order.payment_status === 'paid' ? 'bg-[#E8F5E9] text-[#2E7D32]' :
                    order.payment_status === 'failed' ? 'bg-[#FFEBEE] text-[#C62828]' :
                    'bg-[#FFF8E1] text-[#F57F17]'
                  }`}>
                    {order.payment_status?.toUpperCase()}
                  </span>
                  {order.is_sent_to_shiprocket && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#E3F2FD] text-[#1565C0] flex items-center gap-1">
                      <Truck size={10} /> Shipped
                    </span>
                  )}
                </div>
                <p className="font-bold text-brand-black mt-1">₹{order.total_amount}</p>
                <p className="text-[12px] text-[#999] mt-0.5">{new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <ChevronRight size={18} className={`text-[#999] transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </button>

            {isExpanded && (
              <div className="border-t border-[#EAEAEA] p-4 md:p-5 space-y-5">
                <div>
                  <p className="font-bold text-[14px] text-brand-black mb-2">Items</p>
                  {order.order_items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between py-1.5 border-b border-[#F0F0F0] last:border-0 text-[14px]">
                      <span>{item.name} <span className="text-[#999]">×{item.quantity}</span></span>
                      <span className="font-semibold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {order.is_sent_to_shiprocket && (
                  <div>
                    <p className="font-bold text-[14px] text-brand-black mb-3">Delivery Status</p>
                    <div className="flex items-center gap-1 overflow-x-auto pb-2">
                      {TRACKING_STEPS.map((step, i) => (
                        <div key={step} className="flex items-center">
                          <div className="flex flex-col items-center min-w-[70px]">
                            <div className={`w-[24px] h-[24px] rounded-full flex items-center justify-center text-[11px] font-bold ${
                              i <= stepIdx ? 'bg-brand-green text-white' : 'bg-[#E0E0E0] text-[#999]'
                            }`}>
                              {i < stepIdx ? '✓' : i + 1}
                            </div>
                            <span className={`text-[10px] mt-1 font-semibold text-center leading-tight ${
                              i <= stepIdx ? 'text-brand-green' : 'text-[#BBB]'
                            }`}>{step}</span>
                          </div>
                          {i < TRACKING_STEPS.length - 1 && (
                            <div className={`w-[20px] h-[2px] mb-4 ${i < stepIdx ? 'bg-brand-green' : 'bg-[#E0E0E0]'}`} />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-[13px]">
                      {order.awb_code && (
                        <div><span className="text-[#999]">AWB: </span><span className="font-mono font-semibold">{order.awb_code}</span></div>
                      )}
                      {order.courier_name && (
                        <div><span className="text-[#999]">Courier: </span><span className="font-semibold">{order.courier_name}</span></div>
                      )}
                    </div>

                    {order.tracking_url && (
                      <a href={order.tracking_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full bg-brand-green text-white font-bold text-[13px] hover:bg-[#1E8A38] transition-colors">
                        <ExternalLink size={14} /> Track Shipment
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
