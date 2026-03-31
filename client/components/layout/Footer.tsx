import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="text-2xl font-black mb-4">GRAINZZ</div>
            <div className="space-y-2 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Phone size={14} />
                <span>96262425 , 9375 6546</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} />
                <span>katariavibhor9@gmail.com</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                <span>B-291, MIG Flats, East of Loni road, Delhi, Delhi – 110093, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/80">
              {['Home', 'About Us', 'FAQs', 'Contact Us', 'My Account'].map((item) => (
                <li key={item}>
                  <Link href={item === 'Home' ? '/' : `/${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-white/80">
              {[
                { label: 'All Products', href: '/products' },
                { label: 'Combos', href: '/combos' },
                { label: 'Sale!', href: '/sale' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-semibold mb-4">Policies</h4>
            <ul className="space-y-2 text-sm text-white/80">
              {['Shipping', 'Return/exchange', 'Terms & Conditions', 'Privacy Policy'].map((item) => (
                <li key={item}>
                  <Link href={`/policies/${item.toLowerCase().replace(/[\/\s]+/g, '-')}`}
                    className="hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Subscribe */}
          <div>
            <h4 className="font-semibold mb-4">Subscribe to get latest offers</h4>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center gap-0 border border-white/40 rounded-md overflow-hidden"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none"
              />
              <button type="submit" className="p-2 bg-white/20 hover:bg-white/30 transition-colors">
                <Send size={16} />
              </button>
            </form>
            <div className="flex items-center gap-3 mt-4">
              {[
                { Icon: Facebook, href: '#' },
                { Icon: Twitter, href: '#' },
                { Icon: Linkedin, href: '#' },
                { Icon: Instagram, href: '#' },
              ].map(({ Icon, href }, i) => (
                <a key={i} href={href}
                  className="w-8 h-8 border border-white/40 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-cream text-text-muted text-center text-sm py-3">
        Copyright © 2026 Grainzz by Vitalicious
      </div>
    </footer>
  );
}
