import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const mainNavLinks = [
  { path: '/', label: 'Home' },
  { path: '/learning', label: 'Learning' },
  { path: '/materials', label: 'Materials' },
  { path: '/about', label: 'About' },
  { path: '/tests', label: 'Tests' },
  { path: '/chat', label: 'Chat' },
  { path: '/bookmarks', label: 'Bookmarks' },
  { path: '/progress', label: 'Progress' },
];

const secondNavLinks = [
  { path: '/', label: 'Home' },
  { path: '/learning', label: 'Learning' },
  { path: '/materials', label: 'Materials' },
  { path: '/chat', label: 'Chat' },
  { path: '/about', label: 'About' },
];

export default function Navbar() {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex flex-col">
      {/* Top Main Navbar */}
      <div className="bg-slate-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🔭</span>
              <span className="font-bold text-white text-sm sm:text-base hidden sm:inline">
                Ethio-cosmos-learning-community
              </span>
              <span className="font-bold text-white text-sm sm:hidden">
                Ethio-cosmos
              </span>
            </Link>

            {/* Desktop Navigation (Main) */}
            <div className="hidden lg:flex items-center gap-1">
              {mainNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                    isActive(link.path)
                      ? 'text-orange-500 bg-orange-500/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                    isActive('/admin')
                      ? 'text-orange-500 bg-orange-500/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>

            {/* Right side - Get Started button */}
            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 text-sm hidden md:inline">{user.displayName || user.email}</span>
                  <Link to="/login">
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                      Account
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link to="/login" className="hidden sm:block">
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                    Get Started
                  </Button>
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                className="lg:hidden p-2 text-gray-300 hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Second Fixed Navbar (Below Top Navbar) */}
      <div className="bg-slate-950/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-12">
            <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto no-scrollbar">
              {secondNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-1 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive(link.path)
                      ? 'text-orange-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive(link.path) && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-white/10 py-4 px-4">
          <div className="flex flex-col gap-1">
            {mainNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                  isActive(link.path)
                    ? 'text-orange-500 bg-orange-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                  isActive('/admin')
                    ? 'text-orange-500 bg-orange-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            {!user && (
              <Link
                to="/login"
                className="px-3 py-2 text-sm font-medium text-orange-500 hover:bg-orange-500/10 rounded-md mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
