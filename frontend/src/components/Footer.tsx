import { Link } from '@tanstack/react-router';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy text-white/80">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-9 w-9 rounded-lg bg-gold flex items-center justify-center text-navy font-display font-bold text-sm">
                MF
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-lg text-gold">Mahveer</span>
                <span className="text-xs text-white/50 tracking-widest uppercase">Finance</span>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Finance Made Simple &amp; Smart. Your trusted partner for all loan solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Home', path: '/' },
                { label: 'Calculators', path: '/calculators' },
                { label: 'Apply for Loan', path: '/apply' },
                { label: 'My Portal', path: '/portal' },
              ].map((l) => (
                <li key={l.path}>
                  <Link to={l.path} className="text-white/60 hover:text-gold transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Loan Products */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Loan Products</h4>
            <ul className="space-y-2 text-sm text-white/60">
              {['Personal Loan', 'Home Loan', 'Business Loan', 'Vehicle Loan', 'Education Loan', 'Gold Loan'].map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-gold shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-gold shrink-0" />
                <span>info@mahveerfinance.in</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-gold shrink-0 mt-0.5" />
                <span>Chennai, Tamil Nadu, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {year} Mahveer Finance. All rights reserved.</p>
          <p className="text-white/30">Finance Made Simple &amp; Smart</p>
        </div>
      </div>
    </footer>
  );
}
