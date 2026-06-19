'use client';

import { Facebook, Twitter, Link as LinkIcon } from 'lucide-react';

export default function ShareButtonsClient({ blogTitle }: { blogTitle: string }) {
  const shareOnFacebook = () => {
    if (typeof window === 'undefined') return;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareOnTwitter = () => {
    if (typeof window === 'undefined') return;
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(blogTitle)}`, '_blank');
  };

  const copyToClipboard = () => {
    if (typeof window === 'undefined') return;
    try {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch {
      // Fallback for Safari or browsers that don't support clipboard API
      alert('Could not copy link.');
    }
  };

  return (
    <div className="flex gap-3">
      <button 
        onClick={shareOnFacebook}
        className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
        title="Share on Facebook"
      >
        <Facebook size={18}/>
      </button>
      <button 
        onClick={shareOnTwitter}
        className="w-10 h-10 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all shadow-sm"
        title="Share on Twitter"
      >
        <Twitter size={18}/>
      </button>
      <button 
        onClick={copyToClipboard}
        className="w-10 h-10 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-gray-600 hover:text-white transition-all shadow-sm"
        title="Copy Link"
      >
        <LinkIcon size={18}/>
      </button>
    </div>
  );
}
