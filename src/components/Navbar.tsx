import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X, User as UserIcon, LogOut, BookOpen, BarChart3, UserCircle } from 'lucide-react';

const publicNavLinks = [
  { path: '/', label: 'Home' },
  { path: '/learning', label: 'Learning' },
  { path: '/materials', label: 'Materials' },
  { path: '/about', label: 'About' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, loading, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setProfileMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex flex-col">
      {/* Top Main Navbar */}
      <div className="bg-purple-950/80 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <span className="text-3xl group-hover:scale-110 transition-transform">🔭</span>
              <span className="font-extrabold text-white text-lg sm:text-xl hidden sm:inline tracking-tight">
                Ethio-cosmos
              </span>
              <span className="font-extrabold text-white text-lg sm:hidden tracking-tight">
                Ethio-cosmos
              </span>
            </Link>

            {/* Desktop Navigation (Main) */}
            <div className="hidden lg:flex items-center gap-2">
              {publicNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 text-base font-bold transition-all rounded-xl ${
                    isActive(link.path)
                      ? 'text-purple-400 bg-purple-500/10 shadow-inner'
                      : 'text-purple-100/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`px-4 py-2 text-base font-bold transition-all rounded-xl ${
                    isActive('/admin')
                      ? 'text-purple-400 bg-purple-500/10 shadow-inner'
                      : 'text-purple-100/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>

            {/* Right side - User Profile / Login */}
            <div className="flex items-center gap-4">
              {!loading && (
                <>
                  {user ? (
                    <div className="relative" ref={profileMenuRef}>
                      <button
                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                        className="flex items-center gap-3 p-1.5 rounded-2xl border border-white/10 hover:bg-white/5 transition-all shadow-lg"
                      >
                        {profile?.avatarUrl ? (
                          <img 
                            src={profile.avatarUrl} 
                            alt="Profile" 
                            className="w-9 h-9 rounded-xl border-2 border-purple-500/50 object-cover" 
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/30">
                            <UserIcon size={20} />
                          </div>
                        )}
                        <span className="text-purple-100 font-bold text-sm hidden md:inline max-w-[120px] truncate">
                          {profile?.username || user.email?.split('@')[0]}
                        </span>
                      </button>

                      {/* Profile Dropdown */}
                      {profileMenuOpen && (
                        <div className="absolute right-0 mt-3 w-56 bg-purple-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl py-3 z-[60] overflow-hidden">
                          <div className="px-5 py-3 border-b border-white/5 mb-2">
                            <p className="text-base font-bold text-white truncate">
                              {profile?.username || 'User'}
                            </p>
                            <p className="text-xs text-purple-300/50 truncate">{user.email}</p>
                          </div>
                          <Link
                            to="/profile"
                            className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-purple-100 hover:bg-purple-500/20 hover:text-white transition-colors"
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            <UserCircle size={18} className="text-purple-400" />
                            Profile
                          </Link>
                          <Link
                            to="/progress"
                            className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-purple-100 hover:bg-purple-500/20 hover:text-white transition-colors"
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            <BarChart3 size={18} className="text-purple-400" />
                            Progress
                          </Link>
                          <Link
                            to="/bookmarks"
                            className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-purple-100 hover:bg-purple-500/20 hover:text-white transition-colors"
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            <BookOpen size={18} className="text-purple-400" />
                            Bookmarks
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors mt-2 border-t border-white/5 pt-3"
                          >
                            <LogOut size={18} />
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <Link to="/login" className="text-sm font-bold text-purple-100 hover:text-white transition-colors">
                        Log In
                      </Link>
                      <Link to="/login">
                        <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl px-6 shadow-lg shadow-purple-500/20">
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              )}

              {/* Mobile menu button */}
              <button
                className="lg:hidden p-2 text-purple-100 hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Second Fixed Navbar (Below Top Navbar) */}
      <div className="bg-purple-950/90 backdrop-blur-xl border-b border-white/5 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-14">
            <div className="flex items-center gap-6 sm:gap-12 overflow-x-auto no-scrollbar">
              {publicNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-2 py-4 text-sm font-bold transition-all whitespace-nowrap tracking-wide ${
                    isActive(link.path)
                      ? 'text-purple-400'
                      : 'text-purple-100/40 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive(link.path) && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 rounded-t-full shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-purple-950/95 backdrop-blur-2xl border-b border-white/10 py-6 px-6 shadow-2xl">
          <div className="flex flex-col gap-2">
            {publicNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-3 text-lg font-bold transition-all rounded-xl ${
                  isActive(link.path)
                    ? 'text-purple-400 bg-purple-500/10'
                    : 'text-purple-100/70 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={`px-4 py-3 text-lg font-bold transition-all rounded-xl ${
                  isActive('/admin')
                    ? 'text-purple-400 bg-purple-500/10'
                    : 'text-purple-100/70 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            {!user && !loading && (
              <Link
                to="/login"
                className="px-4 py-3 text-lg font-bold text-purple-400 hover:bg-purple-500/10 rounded-xl mt-4 border border-purple-500/20 text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
