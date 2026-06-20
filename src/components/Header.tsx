import React from 'react';
import { Sparkles, Menu, X, ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { useStore } from '../store';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export function Header() {
  const { user, openAuthModal, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Tools', path: '/#tools' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'API', path: '/api-docs' },
  ];

  const handleNavClick = (path: string) => {
    setMobileMenuOpen(false);
    if (path.startsWith('/#')) {
      if (location.pathname !== '/') {
        navigate(path);
      } else {
        const id = path.substring(2);
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else {
      navigate(path);
    }
  };

  return (
    <header className="sticky top-0 z-50 h-16 flex items-center justify-between px-4 sm:px-8 border-b border-white/10 glass w-full">
      <div className="flex items-center space-x-12">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick('/')}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white shadow-md shadow-indigo-600/20 font-bold">
            JB
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Joni Baba AI
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link.path)}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              {link.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="hidden md:flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-white/5 text-xs text-white">
              <div className="status-dot"></div>
              <span>{user.plan === 'Free' ? user.credits : '∞'} Credits</span>
            </div>
            <Link to="/dashboard">
              <Button variant="ghost" className="hidden lg:flex">Workspace</Button>
            </Link>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white font-medium text-sm cursor-pointer shadow-lg" onClick={() => navigate('/dashboard')}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        ) : (
          <>
            <button onClick={() => openAuthModal('login')} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Login
            </button>
            <Button onClick={() => openAuthModal('signup')} className="rounded-full">
              Sign Up
            </Button>
          </>
        )}
      </div>

      {/* Mobile toggle */}
      <div className="flex items-center md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-400 p-2"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden absolute top-16 left-0 right-0 border-b border-white/10 bg-[#0B1120] overflow-hidden shadow-2xl glass"
          >
            <div className="px-4 py-6 space-y-4 flex flex-col">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.path)}
                  className="text-left text-lg font-medium text-slate-200"
                >
                  {link.name}
                </button>
              ))}
              <div className="h-px bg-white/10 my-4" />
              {user ? (
                <>
                  <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/dashboard')}>
                    Workspace
                  </Button>
                  <Button variant="ghost" className="w-full text-red-400 justify-start" onClick={logout}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <Button variant="outline" className="w-full" onClick={() => { setMobileMenuOpen(false); openAuthModal('login'); }}>
                    Login
                  </Button>
                  <Button className="w-full rounded-full" onClick={() => { setMobileMenuOpen(false); openAuthModal('signup'); }}>
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
