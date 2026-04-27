'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, User, MapPin, Package, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function AccountPage() {
  const { user, loading, signOut, setAuthModalOpen } = useAuthStore();
  const router = useRouter();

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
            
            <button className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl bg-brand-light text-brand-green font-bold transition-colors">
               <User size={20} strokeWidth={2.5}/>
               <span>Profile Details</span>
            </button>
            <button className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl hover:bg-[#F2F2F2] text-brand-black font-semibold transition-colors">
               <Package size={20} strokeWidth={2.5}/>
               <span>My Orders</span>
            </button>
            <button className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl hover:bg-[#F2F2F2] text-brand-black font-semibold transition-colors">
               <MapPin size={20} strokeWidth={2.5}/>
               <span>Saved Addresses</span>
            </button>
            <button className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl hover:bg-[#F2F2F2] text-brand-black font-semibold transition-colors">
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
          <div className="flex-1 bg-white rounded-[20px] border border-[#EAEAEA] shadow-sm p-[32px] md:p-[48px]">
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
        </div>
      </div>
    </div>
  );
}
