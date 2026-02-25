import { useState } from 'react';
import { Link, useRouter } from '@tanstack/react-router';
import { Menu, X, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Calculators', path: '/calculators' },
  { label: 'Apply Now', path: '/apply' },
  { label: 'My Portal', path: '/portal' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  return (
    <header className="sticky top-0 z-50 bg-navy shadow-navy border-b border-navy-light">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/assets/generated/mavir-logo.dim_256x256.png"
            alt="Mahveer Finance"
            className="h-9 w-9 rounded-lg object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const sibling = target.nextElementSibling as HTMLElement;
              if (sibling) sibling.style.display = 'flex';
            }}
          />
          <div
            className="h-9 w-9 rounded-lg bg-gold items-center justify-center text-navy font-display font-bold text-sm hidden"
            aria-hidden="true"
          >
            MF
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-bold text-lg text-gold tracking-wide">Mahveer</span>
            <span className="text-xs text-white/70 tracking-widest uppercase">Finance</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPath === link.path
                  ? 'bg-gold text-navy'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/admin"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentPath === '/admin'
                ? 'bg-gold text-navy'
                : 'text-white/50 hover:text-white/80 hover:bg-white/10'
            }`}
          >
            Admin
          </Link>

          {/* Auth links separator */}
          <div className="w-px h-5 bg-white/20 mx-1" />

          <Link
            to="/login"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentPath === '/login'
                ? 'bg-gold text-navy'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <LogIn size={14} />
            Login
          </Link>
          <Link
            to="/register"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
              currentPath === '/register'
                ? 'bg-gold text-navy'
                : 'bg-gold/20 text-gold hover:bg-gold hover:text-navy'
            }`}
          >
            <UserPlus size={14} />
            Register
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white p-2 rounded-md hover:bg-white/10 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-navy-dark border-t border-navy-light px-4 py-3 space-y-1">
          {[...navLinks, { label: 'Admin', path: '/admin' }].map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                currentPath === link.path
                  ? 'bg-gold text-navy'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-white/10 pt-2 mt-2 space-y-1">
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                currentPath === '/login'
                  ? 'bg-gold text-navy'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <LogIn size={15} />
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                currentPath === '/register'
                  ? 'bg-gold text-navy'
                  : 'bg-gold/20 text-gold hover:bg-gold hover:text-navy'
              }`}
            >
              <UserPlus size={15} />
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
