import React from 'react';
import { useAuth } from '../context/AuthContext';

const socialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com/',
    icon: (
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
        <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.254-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.396.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.36.31.68.921.68 1.857 0 1.34-.012 2.422-.012 2.753 0 .267.18.578.688.48C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/>
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/',
    icon: (
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
        <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm15.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.88v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z"/>
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/',
    icon: (
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.497 5.783 2.225 7.15 2.163 8.416 2.105 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.425 3.678 1.406 2.697 2.387 2.403 3.499 2.344 4.78.013 8.332 0 8.741 0 12c0 3.259.013 3.668.072 4.948.059 1.281.353 2.393 1.334 3.374.981.981 2.093 1.275 3.374 1.334C8.332 23.987 8.741 24 12 24c3.259 0 3.668-.013 4.948-.072 1.281-.059 2.393-.353 3.374-1.334.981-.981 1.275-2.093 1.334-3.374.059-1.28.072-1.689.072-4.948 0-3.259-.013-3.668-.072-4.948-.059-1.281-.353-2.393-1.334-3.374-.981-.981-2.093-1.275-3.374-1.334C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/>
      </svg>
    ),
  },
  {
    name: 'Twitter',
    href: 'https://twitter.com/',
    icon: (
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
        <path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.92 4.92 0 0 0-8.384 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.117 2.823 5.247a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.057 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/>
      </svg>
    ),
  },
];

const Footer = () => {
  const { user } = useAuth();
  // Handler for protected links
  const handleProtectedClick = (e) => {
    if (!user) {
      e.preventDefault();
      window.alert('Please login or signup to access this page.');
    }
  };
  return (
    <footer style={{ backgroundColor: '#FFFBEB' }} className="pt-12 pb-6 px-4">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between gap-8">
      {/* Column 1: Logo & Description */}
      <div className="md:w-1/4 flex flex-col items-start">
        <span className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">VlogSite</span>
        <p className="text-slate-700 text-sm leading-relaxed">
          Blogify is a modern platform to share your stories, ideas, and expertise with the world. <br />
          Discover, write, and connect with a vibrant community of creators.
        </p>
      </div>
      {/* Column 2: Quick Navigation */}
      <nav className="md:w-1/4">
        <h3 className="text-lg font-semibold text-slate-900 mb-3">Quick Links</h3>
        <ul className="space-y-2">
          <li>
            <a href="/posts" className="text-slate-700 hover:text-green-600 transition-all">Home</a>
          </li>
          <li>
            <a href="/about" className="text-slate-700 hover:text-green-600 transition-all">About</a>
          </li>
          <li>
            <a href="/contact" className="text-slate-700 hover:text-green-600 transition-all">Contact</a>
          </li>
        </ul>
      </nav>
      {/* Column 3: User Section */}
      <nav className="md:w-1/4">
        <h3 className="text-lg font-semibold text-slate-900 mb-3">User</h3>
        <ul className="space-y-2">
          <li>
            <a href="/login" className="text-slate-700 hover:text-green-600 transition-all">Login</a>
          </li>
          <li>
            <a href="/signup" className="text-slate-700 hover:text-green-600 transition-all">Signup</a>
          </li>
          
          <li>
            <a href="/profile" className="text-slate-700 hover:text-green-600 transition-all" onClick={handleProtectedClick}>Profile</a>
          </li>
          <li>
            <a href="/create-post" className="text-slate-700 hover:text-green-600 transition-all" onClick={handleProtectedClick}>Write Post</a>
          </li>
        </ul>
      </nav>
      {/* Column 4: Social Media */}
      <div className="md:w-1/4">
        <h3 className="text-lg font-semibold text-slate-900 mb-3">Follow Us</h3>
        <div className="flex space-x-4">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.name}
              className="text-slate-700 hover:text-green-600 transition-all transform hover:scale-105"
            >
              {link.icon}
            </a>
          ))}
        </div>
      </div>
    </div>
    {/* Divider and Bottom Note */}
    <div className="max-w-7xl mx-auto mt-10">
      <hr className="border-slate-200 mb-4" />
      <p className="text-center text-slate-700 text-sm">
        © 2025 Blogify. All Rights Reserved.
      </p>
    </div>
  </footer>
  );
};

export default Footer;
