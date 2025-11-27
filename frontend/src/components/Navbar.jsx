import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav style={{ backgroundColor: '#FFFBEB' }} className="sticky top-0 z-50 w-full bg-[#FFFBEB]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2 text-text-light dark:text-text-dark cursor-pointer" onClick={() => { setMobileOpen(false); navigate('/'); }}>
          <div className="size-6 text-primary">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M21.738 12 12 21.738 2.262 12 12 2.262 21.738 12zM7.121 10.5h9.758L12 5.621 7.121 10.5z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold">VlogSite</h2>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link className="text-lg font-semibold hover:text-primary dark:hover:text-primary transition-colors" to="/">Home</Link>
          <Link className="text-lg font-semibold text-text-muted-light dark:text-text-muted-dark hover:text-primary dark:hover:text-primary transition-colors" to="/posts">Articles</Link>
          <Link className="text-lg font-semibold text-text-muted-light dark:text-text-muted-dark hover:text-primary dark:hover:text-primary transition-colors" to="/create-post">Post</Link>
          <Link className="text-lg font-semibold text-text-muted-light dark:text-text-muted-dark hover:text-primary dark:hover:text-primary transition-colors" to="/profile">Profile</Link>



          {/* Auth Buttons */}
          {!user ? (
            <button
              onClick={() => navigate('/login')}
              style={{ backgroundColor: 'transparent' }}
              className="px-4 py-2 rounded-lg bg-transparent border border-primary/20 text-primary text-sm font-semibold hover:bg-white/5 dark:hover:bg-black/10 transition"
            >
              Login
            </button>
          ) : (
            <>
              <button
                onClick={handleLogout}
                style={{ backgroundColor: 'transparent' }}
                className="px-4 py-2 rounded-lg bg-transparent border border-red-500 text-red-500 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/10 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileOpen((s) => !s)}
            style={{ backgroundColor: 'transparent' }}
            className="p-2 rounded-md bg-transparent hover:bg-white/5 dark:hover:bg-black/10"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileOpen && (
        <div className="md:hidden">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col space-y-3">
            <Link onClick={() => setMobileOpen(false)} className="text-base font-medium" to="/">Home</Link>
            <Link onClick={() => setMobileOpen(false)} className="text-base font-medium" to="/posts">Articles</Link>
            <Link onClick={() => setMobileOpen(false)} className="text-base font-medium" to="/create-post">Post</Link>
            <Link onClick={() => setMobileOpen(false)} className="text-base font-medium" to="/profile">Profile</Link>
            <Link onClick={() => setMobileOpen(false)} className="text-base font-medium" to="/login">Login</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
