'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Package, Truck, MapPin, CreditCard, Calendar, Check, X, ExternalLink, Download, ArrowLeft } from 'lucide-react';
import { getOrderById } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

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

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/account');
      return;
    }

    if (orderId) {
      setLoading(true);
      getOrderById(orderId)
        .then((res) => {
          if (res.success) {
            setOrder(res.data);
          } else {
            setError('Order not found');
          }
        })
        .catch((err) => {
          setError(err.message || 'Failed to fetch order details');
        })
        .finally(() => setLoading(false));
    }
  }, [orderId, user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="bg-[#FCF9F2] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-green/20 border-t-brand-green rounded-full animate-spin"></div>
          <p className="text-brand-green font-bold animate-pulse">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-[#FCF9F2] min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-red-50 text-brand-red rounded-full flex items-center justify-center mb-6">
          <X size={40} />
        </div>
        <h2 className="text-2xl font-bold text-brand-black mb-2">{error || 'Order not found'}</h2>
        <p className="text-[#7A7A7A] mb-8">We couldn't find the order you're looking for.</p>
        <Link href="/account" className="bg-brand-black text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-[#333] transition-all">
          <ArrowLeft size={18} /> Back to Account
        </Link>
      </div>
    );
  }

  const stepIdx = getStepIndex(order.delivery_status || (order.status === 'delivered' ? 'Delivered' : order.status === 'shipped' ? 'Shipped' : ''));
  const isDelivered = stepIdx === 4;

  return (
    <div className="bg-[#FCF9F2] min-h-screen pb-[100px]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-[60px] pt-[32px]">
        {/* Breadcrumb */}
        <div className="flex items-center gap-[8px] text-[13px] md:text-[14px] font-semibold text-[#8E8E8E] mb-[24px] tracking-wide">
          <Link href="/" className="hover:text-brand-green transition-colors">Home</Link>
          <ChevronLeft size={14} className="rotate-180" />
          <Link href="/account" className="hover:text-brand-green transition-colors">My Account</Link>
          <ChevronLeft size={14} className="rotate-180" />
          <span className="text-brand-black">Order #{orderId.slice(0, 8).toUpperCase()}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/account" className="p-2 hover:bg-white rounded-full transition-colors text-[#8E8E8E] hover:text-brand-black">
                <ArrowLeft size={24} />
              </Link>
              <h1 className="text-[28px] md:text-[36px] font-bold text-brand-black font-brand tracking-tight">
                Order <span className="text-brand-red">Details</span>
              </h1>
            </div>
            <p className="text-[#7A7A7A] font-medium ml-12">
              Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          
          <div className="flex gap-3 ml-12 md:ml-0">
             <button className="bg-white border border-[#EAEAEA] text-brand-black px-6 py-2.5 rounded-xl font-bold text-[14px] hover:bg-[#F9F9F9] transition-all flex items-center gap-2 shadow-sm">
                <Download size={18} /> Invoice
             </button>
             {order.tracking_url && (
                <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="bg-brand-green text-white px-6 py-2.5 rounded-xl font-bold text-[14px] hover:bg-[#1E8A38] transition-all flex items-center gap-2 shadow-sm">
                  <ExternalLink size={18} /> Track Order
                </a>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Delivery Status Card */}
            <div className="bg-white rounded-[24px] border border-[#EAEAEA] shadow-sm overflow-hidden">
               <div className="p-6 border-b border-[#F0F0F0] flex items-center justify-between">
                  <h3 className="font-bold text-brand-black text-[18px] flex items-center gap-2">
                    <Truck size={20} className="text-brand-green" /> Delivery Status
                  </h3>
                  <span className={`px-4 py-1.5 rounded-full text-[13px] font-bold ${
                    order.payment_status === 'paid' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 
                    order.payment_status === 'failed' ? 'bg-[#FFEBEE] text-[#C62828]' : 'bg-[#FFF8E1] text-[#F57F17]'
                  }`}>
                    {order.payment_status?.toUpperCase()}
                  </span>
               </div>
               
               <div className="p-8">
                  {/* Status Timeline */}
                  <div className="flex items-center w-full mb-12 relative">
                    {TRACKING_STEPS.map((step, i) => (
                      <div key={step} className="flex-1 flex flex-col items-center relative group">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-all duration-300 ${
                          i <= stepIdx ? 'bg-brand-green text-white shadow-lg scale-110' : 'bg-white border-2 border-[#EAEAEA] text-[#999]'
                        }`}>
                          {i < stepIdx ? <Check size={20} strokeWidth={3} /> : i + 1}
                        </div>
                        <span className={`text-[12px] md:text-[13px] mt-4 font-bold text-center absolute top-10 whitespace-nowrap transition-colors duration-300 ${
                          i <= stepIdx ? 'text-brand-black' : 'text-[#767676]'
                        }`}>{step}</span>
                        
                        {i < TRACKING_STEPS.length - 1 && (
                          <div className="absolute top-5 left-1/2 w-full h-[3px] -z-0 bg-[#EAEAEA]">
                             <div className={`h-full bg-brand-green transition-all duration-700 ease-in-out ${
                               i < stepIdx ? 'w-full' : 'w-0'
                             }`} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-16 bg-[#F9F9F9] rounded-2xl p-5 flex items-start gap-4 border border-[#F0F0F0]">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-brand-green flex-shrink-0">
                      <Package size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-black">
                        {order.delivery_status || (order.is_sent_to_shiprocket ? 'In Transit via Shiprocket' : isDelivered ? 'Order Delivered' : 'Processing Order')}
                      </h4>
                      <p className="text-[14px] text-[#7A7A7A] mt-1">
                        {isDelivered ? 'Your order has been successfully delivered. We hope you enjoy your Grainzz products!' : 
                         order.is_sent_to_shiprocket ? `Tracking ID: ${order.awb_code || 'Pending'}. Your package is on its way.` :
                         'Our team is preparing your package for dispatch. You will receive a tracking link once it is shipped.'}
                      </p>
                    </div>
                  </div>
               </div>
            </div>

            {/* Items Card */}
            <div className="bg-white rounded-[24px] border border-[#EAEAEA] shadow-sm overflow-hidden">
               <div className="p-6 border-b border-[#F0F0F0]">
                  <h3 className="font-bold text-brand-black text-[18px]">Order Items ({(order.order_items || order.items || []).length})</h3>
               </div>
               <div className="divide-y divide-[#F0F0F0]">
                  {(order.order_items || order.items || []).map((item: any, i: number) => (
                    <div key={i} className="p-6 flex gap-6 hover:bg-[#FAFAFA] transition-colors">
                      <div className="w-[100px] h-[100px] bg-[#F5F0E8] rounded-2xl overflow-hidden flex-shrink-0 border border-[#EAEAEA]">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#CCC]"><Package size={32} /></div>
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <Link href={`/products/${item.product_id}`} className="font-bold text-brand-black text-[18px] hover:text-brand-green transition-colors line-clamp-1">
                            {item.name}
                          </Link>
                          <p className="text-[14px] font-medium text-[#7A7A7A] mt-1">Quantity: {item.quantity}</p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                           <div className="flex items-baseline gap-2">
                              <span className="text-brand-red font-bold text-[18px]">₹{item.price}</span>
                              {item.mrp > item.price && (
                                <span className="text-[14px] text-[#8E8E8E] line-through font-medium">₹{item.mrp}</span>
                              )}
                           </div>
                           <Link href={`/products/${item.product_id}`} className="text-[14px] font-bold text-brand-green hover:underline">
                              Buy Again
                           </Link>
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
             {/* Order Summary */}
             <div className="bg-[#eefbdc] text-brand-black rounded-[24px] p-8 shadow-sm relative overflow-hidden border border-[#d8f0b5]">
                <div className="relative z-10">
                  <h3 className="font-bold text-[20px] mb-6 flex items-center gap-2 text-brand-green">
                    <CreditCard size={20} /> Order Summary
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between text-[#555555] font-medium">
                      <span>Subtotal</span>
                      <span className="text-brand-black">₹{order.subtotal || order.total_amount + (order.discount_amount || 0)}</span>
                    </div>
                    {order.discount_amount > 0 && (
                      <div className="flex justify-between text-[#555555] font-medium">
                        <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
                        <span className="text-brand-green">-₹{order.discount_amount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#555555] font-medium">
                      <span>Shipping</span>
                      <span className="text-brand-black">Free</span>
                    </div>
                    <div className="pt-4 border-t border-brand-green/20 flex justify-between items-center">
                      <span className="font-bold text-[18px]">Total</span>
                      <span className="text-[24px] font-bold text-brand-green">₹{order.total_amount}</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-brand-green/20 flex items-center gap-3">
                     <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-brand-green shadow-sm">
                        <Check size={20} />
                     </div>
                     <div>
                        <p className="text-[12px] text-[#555555] font-bold uppercase tracking-wider">Payment Method</p>
                        <p className="font-bold text-[15px]">{order.payment_status === 'paid' ? 'Online Payment (PhonePe)' : 'Pending'}</p>
                     </div>
                  </div>
                </div>
                
                {/* Decorative background element */}
                <div className="absolute -bottom-10 -right-10 w-[200px] h-[200px] bg-brand-green/5 rounded-full blur-[60px]"></div>
             </div>

             {/* Shipping Information */}
             <div className="bg-white rounded-[24px] border border-[#EAEAEA] p-8 shadow-sm">
                <h3 className="font-bold text-brand-black text-[18px] mb-6 flex items-center gap-2">
                  <MapPin size={20} className="text-brand-red" /> Shipping Address
                </h3>
                
                <div className="space-y-1">
                   <p className="font-bold text-brand-black text-[16px]">{order.user_name}</p>
                   <p className="text-[#7A7A7A] text-[15px] leading-relaxed">
                     {order.user_address}
                   </p>
                   <p className="text-[#7A7A7A] text-[15px]">{order.user_city}, {order.user_state} - {order.user_pincode}</p>
                   <p className="pt-4 font-bold text-brand-black text-[15px]">Phone: <span className="font-medium text-[#7A7A7A]">{order.user_phone}</span></p>
                   <p className="font-bold text-brand-black text-[15px]">Email: <span className="font-medium text-[#7A7A7A]">{order.user_email}</span></p>
                </div>
             </div>

             {/* Need Help? */}
             <div className="bg-brand-light rounded-[24px] p-8 border border-brand-green/10">
                <h3 className="font-bold text-brand-black text-[18px] mb-4">Need help?</h3>
                <p className="text-[#7A7A7A] text-[14px] leading-relaxed mb-6">
                  If you have any questions regarding your order, please contact our support team.
                </p>
                <div className="space-y-3">
                   <Link href="/contact" className="w-full py-3 rounded-xl border border-brand-black font-bold text-[14px] flex items-center justify-center hover:bg-brand-black hover:text-white transition-all">
                      Contact Us
                   </Link>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
