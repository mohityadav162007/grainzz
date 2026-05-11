'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, User, MapPin, Package, Settings, LogOut, PackageOpen, ExternalLink, Truck, Check, X, Lock, Eye, EyeOff, Plus, Pencil, Trash2, Star, Loader2 } from 'lucide-react';
import { getUserOrders, sendOTP, verifyOTPAndSetPassword, getProductSlugById, getSavedAddresses, addSavedAddress, updateSavedAddress, deleteSavedAddress, setDefaultAddress, type SavedAddress } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

type Tab = 'profile' | 'orders' | 'addresses' | 'settings';

export default function AccountPage() {
  const { user, loading, signOut, setAuthModalOpen } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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
              <SavedAddressesTab userId={user.id} />
            )}

            {activeTab === 'settings' && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-[32px]">
                  {isChangingPassword && (
                    <button onClick={() => setIsChangingPassword(false)} className="p-2 hover:bg-[#F2F2F2] rounded-full transition-colors text-[#888888] hover:text-brand-black">
                      <ChevronRight size={20} className="rotate-180" />
                    </button>
                  )}
                  <h2 className="text-[24px] font-bold text-brand-black">{isChangingPassword ? 'Change Password' : 'Account Settings'}</h2>
                </div>

                {!isChangingPassword ? (
                  <div className="space-y-6 max-w-[500px]">
                    <div 
                      onClick={() => setIsChangingPassword(true)}
                      className="flex items-center justify-between p-4 rounded-xl border border-[#EAEAEA] hover:border-[#D0D0D0] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-brand-light rounded-full flex items-center justify-center text-brand-green">
                          <Lock size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-brand-black text-[15px]">Change Password</h4>
                          <p className="text-[13px] text-[#888888] font-medium pt-0.5">Update your login credentials securely.</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-[#888888] group-hover:text-brand-black transition-colors" />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-[#EAEAEA] hover:border-[#D0D0D0] transition-colors cursor-pointer group opacity-60">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center text-[#888888]">
                          <Settings size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-brand-black text-[15px]">Notification Preferences</h4>
                          <p className="text-[13px] text-[#888888] font-medium pt-0.5">Manage your email alerts and SMS.</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-[#888888]" />
                    </div>
                  </div>
                ) : (
                  <ChangePasswordForm onCancel={() => setIsChangingPassword(false)} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Change Password Form ───────────────────────────────────────────────────

function ChangePasswordForm({ onCancel }: { onCancel: () => void }) {
  const { user } = useAuthStore();
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSendOTP = async () => {
    if (!user?.email) return;
    setLoading(true);
    setStatus(null);
    try {
      await sendOTP(user.email);
      setStep('verify');
      setStatus({ type: 'success', message: 'Verification code sent to your email!' });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Failed to send verification code.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    if (password !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    if (password.length < 6) {
      setStatus({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      await verifyOTPAndSetPassword(user.email, otp, password);
      setStatus({ type: 'success', message: 'Password updated successfully!' });
      // Clear fields
      setOtp('');
      setPassword('');
      setConfirmPassword('');
      setTimeout(onCancel, 2000);
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Verification failed. Please check the code.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[400px] animate-fade-in">
      {step === 'send' ? (
        <div className="space-y-6">
          <p className="text-[14px] text-[#7A7A7A] leading-relaxed">
            To ensure it's you, we'll send a 6-digit verification code to <span className="font-bold text-brand-black">{user?.email}</span>.
          </p>
          
          {status?.type === 'error' && (
            <div className="p-4 rounded-xl text-sm font-medium flex items-center gap-3 bg-[#FFEBEE] text-[#C62828]">
              <X size={18} /> {status.message}
            </div>
          )}

          <button
            onClick={handleSendOTP}
            disabled={loading}
            className="w-full bg-brand-black hover:bg-[#1A1A1A] text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleVerifyAndUpdate} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[14px] font-semibold text-[#888888]">Verification Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl border border-[#EAEAEA] focus:border-brand-green outline-none transition-colors font-bold text-center text-[20px] tracking-[8px]"
              placeholder="000000"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-semibold text-[#888888]">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#EAEAEA] focus:border-brand-green outline-none transition-colors pr-12 font-medium"
                placeholder="Min. 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888888] hover:text-brand-black"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-semibold text-[#888888]">Confirm New Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-[#EAEAEA] focus:border-brand-green outline-none transition-colors font-medium"
              placeholder="Repeat new password"
            />
          </div>

          {status && (
            <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${
              status.type === 'success' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#C62828]'
            }`}>
              {status.type === 'success' ? <Check size={18} /> : <X size={18} />}
              {status.message}
            </div>
          )}

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-brand-black hover:bg-[#1A1A1A] text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying...' : 'Update Password'}
            </button>
            <button
              type="button"
              onClick={() => setStep('send')}
              className="flex-1 border border-[#EAEAEA] hover:bg-[#F9F9F9] text-brand-black py-3 rounded-xl font-bold transition-all"
            >
              Resend Code
            </button>
          </div>
        </form>
      )}
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
  const { addItem, openCart } = useCartStore();
  const router = useRouter();

  const handleBuyAgain = (item: any) => {
    addItem({
      id: item.product_id,
      name: item.name,
      price: Number(item.price),
      mrp: Number(item.mrp || item.price),
      image: item.image || '',
      quantity: item.quantity || 1,
    });
    router.push('/cart');
  };

  const handleWriteReview = async (productId: string) => {
    const slug = await getProductSlugById(productId);
    if (slug) {
      router.push(`/products/${slug}#write-review`);
    }
  };

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
    <div className="animate-fade-in space-y-6">
      <h2 className="text-[24px] font-bold text-brand-black mb-6">Your Orders</h2>
      {orders.map(order => {
        const isExpanded = expandedId === order.id;
        const stepIdx = getStepIndex(order.delivery_status || (order.status === 'delivered' ? 'Delivered' : order.status === 'shipped' ? 'Shipped' : ''));

        return (
          <div key={order.id} className="border border-[#D5D9D9] rounded-xl overflow-hidden bg-white shadow-sm mb-6">
            {/* Header */}
            <div className="bg-[#F0F2F2] border-b border-[#D5D9D9] p-4 flex flex-wrap md:flex-nowrap items-start md:items-center justify-between gap-4 text-sm text-[#565959]">
              <div className="flex gap-8 flex-wrap">
                <div className="flex flex-col">
                  <span className="text-[12px] uppercase">Order Placed</span>
                  <span className="text-[#0F1111] font-medium">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] uppercase">Total</span>
                  <span className="text-[#0F1111] font-medium">₹{order.total_amount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] uppercase">Ship To</span>
                  <span className="text-brand-green font-medium cursor-pointer hover:underline truncate max-w-[120px]">{order.user_address?.split(',')[0] || userEmail.split('@')[0]}</span>
                </div>
              </div>
              <div className="flex flex-col md:items-end w-full md:w-auto mt-2 md:mt-0">
                <Link href={`/account/orders/${order.id}`} className="text-[12px] uppercase hover:text-brand-green transition-colors">Order # {order.id?.slice(0, 12).toUpperCase()}</Link>
                <div className="flex gap-2 mt-1">
                  <Link href={`/account/orders/${order.id}`} className="text-[#007185] hover:text-[#C45500] hover:underline cursor-pointer">View order details</Link>
                  <span className="text-[#D5D9D9]">|</span>
                  <span className="text-[#007185] hover:text-[#C45500] hover:underline cursor-pointer">Invoice</span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 md:p-6">
              {/* Status Section */}
              <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                  {order.payment_status === 'paid' ? (
                    <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32]">
                      <PackageOpen size={18} strokeWidth={2.5}/>
                    </div>
                  ) : order.payment_status === 'failed' ? (
                    <div className="w-8 h-8 rounded-full bg-[#FFEBEE] flex items-center justify-center text-[#C62828]">
                      <X size={18} strokeWidth={2.5}/>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#FFF8E1] flex items-center justify-center text-[#F57F17]">
                      <Package size={18} strokeWidth={2.5}/>
                    </div>
                  )}
                  <div>
                    <h3 className={`text-lg font-bold ${order.payment_status === 'failed' ? 'text-[#C62828]' : 'text-[#0F1111]'}`}>
                      {order.delivery_status || (order.is_sent_to_shiprocket ? 'Shipped via Shiprocket' : order.status === 'delivered' ? 'Delivered' : order.payment_status === 'failed' ? 'Payment Failed' : 'Preparing for Dispatch')}
                    </h3>
                    <p className="text-sm text-[#565959]">
                      {order.payment_status === 'paid' && !order.is_sent_to_shiprocket && 'Your package is being processed in our warehouse.'}
                      {order.payment_status === 'failed' && 'Your payment could not be processed. Please try again.'}
                      {order.is_sent_to_shiprocket && `Tracking: ${order.awb_code || 'Pending'} (${order.courier_name || 'Carrier'})`}
                    </p>
                  </div>
                </div>
                
                {order.is_sent_to_shiprocket && (
                  <button 
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    className="px-4 py-2 bg-white border border-[#D5D9D9] hover:bg-[#F7FABA] rounded-[8px] text-sm font-medium shadow-[0_2px_5px_rgba(213,217,217,0.5)] transition-all flex items-center gap-2"
                  >
                    {isExpanded ? 'Hide Tracking' : 'Track Package'}
                  </button>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-6">
                {order.order_items?.map((item: any, i: number) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-4 border-t border-[#F0F2F2] pt-6">
                    <div className="w-20 h-20 bg-[#F5F0E8] rounded-md overflow-hidden flex-shrink-0 border border-[#EAEAEA]">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#CCC]"><Package size={24} /></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.product_id || '#'}`} className="text-[#007185] hover:text-[#C45500] hover:underline font-medium text-base line-clamp-2 leading-snug">
                        {item.name}
                      </Link>
                      <div className="text-sm text-[#565959] mt-1">Quantity: {item.quantity}</div>
                      <div className="text-sm font-bold text-[#B12704] mt-1">₹{item.price}</div>
                      
                      <div className="mt-3 flex flex-wrap gap-3">
                        <button onClick={() => handleBuyAgain(item)} className="px-4 py-1.5 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] rounded-full text-sm font-medium transition-colors shadow-sm border border-[#FCD200]">
                          Buy it again
                        </button>
                        {item.product_id && (
                          <button onClick={() => handleWriteReview(item.product_id)} className="px-4 py-1.5 bg-white border border-[#D5D9D9] hover:bg-[#F3F3F3] text-[#0F1111] rounded-full text-sm font-medium transition-colors shadow-sm">
                            Write a product review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Expandable Tracking Area */}
              {isExpanded && order.is_sent_to_shiprocket && (
                <div className="mt-8 pt-6 border-t border-[#D5D9D9] bg-[#F8F9FA] -mx-5 -mb-6 p-6 rounded-b-xl">
                  <h4 className="font-bold text-[#0F1111] mb-6">Tracking Details</h4>
                  
                  <div className="flex items-center w-full max-w-3xl mx-auto mb-8 px-4">
                    {TRACKING_STEPS.map((step, i) => (
                      <div key={step} className="flex-1 flex flex-col items-center relative group">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                          i <= stepIdx ? 'bg-brand-green text-white shadow-md' : 'bg-white border-2 border-[#D5D9D9] text-[#999]'
                        }`}>
                          {i < stepIdx ? <Check size={16} strokeWidth={3} /> : i + 1}
                        </div>
                        <span className={`text-[11px] mt-2 font-semibold text-center absolute top-10 whitespace-nowrap ${
                          i <= stepIdx ? 'text-[#0F1111]' : 'text-[#767676]'
                        }`}>{step}</span>
                        {i < TRACKING_STEPS.length - 1 && (
                          <div className={`absolute top-4 left-1/2 w-full h-[3px] -z-0 ${
                            i < stepIdx ? 'bg-brand-green' : 'bg-[#D5D9D9]'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center mt-12 mb-2">
                    {order.tracking_url ? (
                      <a href={order.tracking_url} target="_blank" rel="noopener noreferrer"
                        className="px-6 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] border border-[#FCD200] rounded-[8px] font-medium text-sm transition-colors shadow-sm flex items-center gap-2">
                        <ExternalLink size={16} /> Open Courier Tracking Page
                      </a>
                    ) : (
                      <p className="text-sm text-[#565959] italic">Detailed tracking URL will be available shortly.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Saved Addresses Tab ────────────────────────────────────────────────────

function SavedAddressesTab({ userId }: { userId: string }) {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: '', phone: '', address_line_1: '', address_line_2: '', city: '', state: '', pincode: '', is_default: false,
  });

  const fetchAddresses = async () => {
    setLoading(true);
    const data = await getSavedAddresses(userId);
    setAddresses(data);
    setLoading(false);
  };

  useEffect(() => { fetchAddresses(); }, [userId]);

  const resetForm = () => {
    setForm({ full_name: '', phone: '', address_line_1: '', address_line_2: '', city: '', state: '', pincode: '', is_default: false });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (addr: SavedAddress) => {
    setForm({
      full_name: addr.full_name,
      phone: addr.phone,
      address_line_1: addr.address_line_1,
      address_line_2: addr.address_line_2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      is_default: addr.is_default || false,
    });
    setEditingId(addr.id || null);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateSavedAddress(editingId, userId, { ...form });
      } else {
        await addSavedAddress({ ...form, user_id: userId, country: 'India' });
      }
      await fetchAddresses();
      resetForm();
    } catch (err: any) {
      alert(err.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSavedAddress(id);
      setDeleteConfirmId(null);
      await fetchAddresses();
    } catch (err: any) {
      alert(err.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(userId, id);
      await fetchAddresses();
    } catch (err: any) {
      alert(err.message || 'Failed to set default');
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center py-16">
        <div className="animate-pulse text-brand-green font-bold">Loading addresses...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-[32px]">
        <h2 className="text-[24px] font-bold text-brand-black">Saved Addresses</h2>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 bg-brand-black hover:bg-[#1A1A1A] text-white px-[24px] py-[10px] rounded-full font-bold text-[14px] transition-colors"
          >
            <Plus size={16} strokeWidth={2.5} /> Add Address
          </button>
        )}
      </div>

      {/* Address Form */}
      {showForm && (
        <form onSubmit={handleSave} className="mb-8 p-6 rounded-[16px] border border-[#EAEAEA] bg-[#FAFAFA]">
          <h3 className="font-bold text-[18px] text-brand-black mb-4">{editingId ? 'Edit Address' : 'Add New Address'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#888]">Full Name *</label>
              <input required value={form.full_name} onChange={e => setForm(f => ({...f, full_name: e.target.value}))}
                className="px-4 py-3 rounded-xl border border-[#EAEAEA] focus:border-brand-green outline-none transition-colors font-medium text-brand-black bg-white" placeholder="Rahul Kumar" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#888]">Phone *</label>
              <input required type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                className="px-4 py-3 rounded-xl border border-[#EAEAEA] focus:border-brand-green outline-none transition-colors font-medium text-brand-black bg-white" placeholder="9876543210" />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[13px] font-semibold text-[#888]">Address Line 1 *</label>
              <input required value={form.address_line_1} onChange={e => setForm(f => ({...f, address_line_1: e.target.value}))}
                className="px-4 py-3 rounded-xl border border-[#EAEAEA] focus:border-brand-green outline-none transition-colors font-medium text-brand-black bg-white" placeholder="House/Flat No, Street, Area" />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[13px] font-semibold text-[#888]">Address Line 2</label>
              <input value={form.address_line_2} onChange={e => setForm(f => ({...f, address_line_2: e.target.value}))}
                className="px-4 py-3 rounded-xl border border-[#EAEAEA] focus:border-brand-green outline-none transition-colors font-medium text-brand-black bg-white" placeholder="Landmark, Nearby" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#888]">City *</label>
              <input required value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))}
                className="px-4 py-3 rounded-xl border border-[#EAEAEA] focus:border-brand-green outline-none transition-colors font-medium text-brand-black bg-white" placeholder="Delhi" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#888]">State *</label>
              <input required value={form.state} onChange={e => setForm(f => ({...f, state: e.target.value}))}
                className="px-4 py-3 rounded-xl border border-[#EAEAEA] focus:border-brand-green outline-none transition-colors font-medium text-brand-black bg-white" placeholder="Delhi" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#888]">Pincode *</label>
              <input required value={form.pincode} onChange={e => setForm(f => ({...f, pincode: e.target.value}))}
                className="px-4 py-3 rounded-xl border border-[#EAEAEA] focus:border-brand-green outline-none transition-colors font-medium text-brand-black bg-white" placeholder="110001" />
            </div>
            <div className="flex items-center gap-3 md:col-span-2 pt-2">
              <input type="checkbox" id="is_default" checked={form.is_default} onChange={e => setForm(f => ({...f, is_default: e.target.checked}))}
                className="w-5 h-5 rounded border-[#EAEAEA] accent-brand-green" />
              <label htmlFor="is_default" className="text-[14px] font-semibold text-brand-black cursor-pointer">Set as default address</label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="submit" disabled={saving}
              className="bg-brand-black hover:bg-[#1A1A1A] text-white px-[32px] py-[12px] rounded-full font-bold text-[14px] transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : (editingId ? 'Update Address' : 'Save Address')}
            </button>
            <button type="button" onClick={resetForm}
              className="border border-[#EAEAEA] hover:bg-[#F2F2F2] text-brand-black px-[32px] py-[12px] rounded-full font-bold text-[14px] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Address List */}
      {addresses.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center text-center pt-10">
          <div className="w-[80px] h-[80px] bg-[#F5F5F5] rounded-full flex items-center justify-center mb-6">
            <MapPin size={40} className="text-[#CCCCCC]" strokeWidth={1.5} />
          </div>
          <h3 className="text-[22px] font-bold text-brand-black mb-2">No addresses saved</h3>
          <p className="text-[15px] text-[#7A7A7A] mb-8 max-w-[300px]">Add your shipping addresses here for a faster checkout experience.</p>
          <button onClick={() => setShowForm(true)} className="bg-brand-black hover:bg-[#1A1A1A] text-white px-[32px] py-[12px] rounded-full font-bold text-[15px] transition-colors">
            Add New Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div key={addr.id} className={`relative p-5 rounded-[16px] border ${addr.is_default ? 'border-brand-green bg-[#F8FDF5]' : 'border-[#EAEAEA] bg-white'} transition-colors`}>
              {addr.is_default && (
                <span className="absolute top-3 right-3 bg-brand-green text-white text-[11px] font-bold px-3 py-1 rounded-full">Default</span>
              )}
              <h4 className="font-bold text-brand-black text-[16px] mb-1">{addr.full_name}</h4>
              <p className="text-[14px] text-[#666] leading-relaxed">
                {addr.address_line_1}{addr.address_line_2 ? `, ${addr.address_line_2}` : ''}<br />
                {addr.city}, {addr.state} - {addr.pincode}<br />
                Phone: {addr.phone}
              </p>
              <div className="flex items-center gap-2 mt-4">
                <button onClick={() => handleEdit(addr)} className="flex items-center gap-1.5 text-[13px] font-bold text-[#007185] hover:text-[#C45500] transition-colors">
                  <Pencil size={14} /> Edit
                </button>
                {!addr.is_default && (
                  <button onClick={() => handleSetDefault(addr.id!)} className="flex items-center gap-1.5 text-[13px] font-bold text-[#007185] hover:text-[#C45500] transition-colors">
                    <Star size={14} /> Set Default
                  </button>
                )}
                {deleteConfirmId === addr.id ? (
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-[12px] text-[#888]">Delete?</span>
                    <button onClick={() => handleDelete(addr.id!)} className="text-[13px] font-bold text-brand-red hover:underline">Yes</button>
                    <button onClick={() => setDeleteConfirmId(null)} className="text-[13px] font-bold text-[#666] hover:underline">No</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirmId(addr.id!)} className="flex items-center gap-1.5 text-[13px] font-bold text-brand-red hover:underline ml-auto">
                    <Trash2 size={14} /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
