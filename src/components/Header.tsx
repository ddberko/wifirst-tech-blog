"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { getCategories } from "@/lib/posts";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import Image from "next/image";
import NewsletterButton from './NewsletterButton';

function WifirstLogo() {
  return (
    <svg viewBox="0 0 1500 435" className="h-7 w-auto" aria-label="Wifirst">
      <g>
        <path fill="#0066CC" d="M707.793,335.091h-19.634l-29.096-78.545l-21.816-69.815l-22.541,70.181l-29.085,78.18h-19.644l-63.995-179.632h19.634l54.185,158.912l54.901-158.912h12.721l54.55,158.912l53.809-158.912h19.65L707.793,335.091z"/>
        <path fill="#0066CC" d="M824.139,96.916c0,18.91-28.725,18.91-28.725,0C795.414,78.01,824.139,78.01,824.139,96.916z M800.508,154.735v180.356h17.82V154.735H800.508z"/>
        <path fill="#0066CC" d="M887.768,335.091V172.552h-36.734v-15.631h36.734v-16.002c0-35.64,14.178-61.457,53.809-61.457c13.461,0,25.463,4.737,35.646,12.368l-8.73,13.096c-9.818-5.831-16.725-9.1-27.645-9.1c-22.541,0-35.627,13.82-35.627,45.092v16.002h59.268v15.631h-59.268v162.539H887.768z"/>
        <path fill="#0066CC" d="M1026.307,96.916c0,18.91-28.73,18.91-28.73,0C997.576,78.01,1026.307,78.01,1026.307,96.916z M1002.676,154.735v180.356h17.818V154.735H1002.676z"/>
        <path fill="#0066CC" d="M1088.115,155.459l0.729,31.999c11.268-24.354,36.729-33.816,59.631-33.816c13.455-0.366,26.549,3.279,38.541,10.544l-7.986,14.541c-9.459-5.81-20.006-8.351-30.555-8.351c-33.447,0.358-59.277,27.268-59.277,59.991v104.724h-17.799V155.459H1088.115z"/>
        <path fill="#0066CC" d="M1330.195,188.189c-18.182-15.999-36-18.913-55.992-18.913c-28.002-0.365-54.914,10.189-54.178,33.099c0.719,23.993,31.996,28.71,54.537,32.713c31.996,5.465,75.998,10.913,74.176,52.735c-1.086,39.634-42.18,50.178-73.816,50.178c-31.631,0-62.902-11.999-78.537-36.002l13.098-11.641c14.895,21.464,41.801,30.554,65.814,30.554c21.809,0,54.898-5.824,55.988-34.178c0.734-25.823-29.09-30.903-58.537-35.648c-34.916-5.82-69.459-12.358-69.82-48.354c-0.363-35.268,34.904-50.54,71.275-50.185c26.182,0,49.086,7.283,66.904,24.006L1330.195,188.189z"/>
        <path fill="#0066CC" d="M1422.467,101.278v54.181h61.09v14.917h-61.09v109.448c0,24.364,5.086,41.45,33.098,41.45c8.721,0,18.533-2.917,27.631-7.275l6.176,14.551c-11.275,5.448-22.537,9.082-33.807,9.082c-38.188,0-50.553-22.544-50.553-57.808V170.376h-38.178v-14.917h38.178v-52.36L1422.467,101.278z"/>
        <path fill="#0066CC" d="M333.085,267.029c12.474-89.32-49.813-171.829-139.118-184.329c-87.29-12.189-168.076,47.027-183.338,133.095c0.265-4.619,0.718-9.251,1.367-13.901c13.275-95.022,101.09-161.297,196.119-148.018c95.063,13.268,161.338,101.073,148.042,196.119c-8.565,61.274-48.094,110.564-100.589,134.316C296.277,359.794,325.992,317.785,333.085,267.029z"/>
        <path fill="#0066CC" d="M383.029,238.915C396.89,132.137,326.92,33.822,224.151,10.148c6.717,0.216,13.509,0.751,20.304,1.634c113.61,14.764,193.713,118.805,178.955,232.385c-14.777,113.59-118.805,193.709-232.398,178.928c-6.809-0.903-13.481-2.102-20.063-3.598C276.366,422.868,369.142,345.68,383.029,238.915z"/>
        <path fill="#0066CC" d="M264.597,139.96c2.176,1.807,4.247,3.675,6.261,5.577c-60.018-44.686-145.214-35.289-193.936,22.781c-49.649,59.179-42.888,146.878,14.48,197.864c-3.428-2.412-6.825-4.987-10.091-7.739c-60.347-50.624-68.234-140.546-17.594-200.91C114.328,97.221,204.261,89.33,264.597,139.96z"/>
      </g>
    </svg>
  );
}

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCategories(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogin() {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);
      setShowUserMenu(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search/?q=${encodeURIComponent(query.trim())}`);
      setShowSearch(false);
      setQuery("");
    }
  }

  return (
    <header className={`bg-white/95 backdrop-blur-md sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? "shadow-md" : "shadow-sm"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <WifirstLogo />
            <div className="hidden sm:flex items-center gap-2">
              <span className="h-5 w-px bg-gray-300" />
              <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                Tech Blog
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#0066CC] rounded-lg hover:bg-blue-50 transition-all">
              Home
            </Link>

            {/* Categories Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#0066CC] rounded-lg hover:bg-blue-50 transition-all flex items-center gap-1"
              >
                Categories
                <svg className={`w-4 h-4 transition-transform ${showCategories ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showCategories && categories.length > 0 && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[180px] animate-fade-in-up" style={{animationDelay: '0s', opacity: 1}}>
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      href={`/category?name=${encodeURIComponent(cat)}`}
                      className="block px-4 py-2.5 text-sm text-gray-600 hover:text-[#0066CC] hover:bg-blue-50 transition-colors"
                      onClick={() => setShowCategories(false)}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Admin link */}
            {user && (
              <Link
                href="/admin"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#0066CC] rounded-lg hover:bg-blue-50 transition-all"
              >
                Admin
              </Link>
            )}

            {/* Search toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 text-gray-500 hover:text-[#0066CC] rounded-lg hover:bg-blue-50 transition-all mr-2"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Newsletter Button */}
            <NewsletterButton variant="compact" />

            {/* Auth Button/Menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 pl-2 pr-2 hover:bg-gray-50 rounded-full border border-gray-100 transition-all"
                >
                  <span className="text-sm font-medium text-gray-700 hidden lg:block">{user.displayName?.split(' ')[0]}</span>
                  {user.photoURL ? (
                    <Image src={user.photoURL} alt={user.displayName || ""} width={28} height={28} className="rounded-full" />
                  ) : (
                    <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {user.displayName?.charAt(0) || "U"}
                    </div>
                  )}
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Account</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.displayName}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white text-sm font-semibold rounded-lg hover:bg-[#0052a3] shadow-sm shadow-blue-200 transition-all active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign In
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Search bar overlay */}
        {showSearch && (
          <div className="pb-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20 focus:border-[#0066CC] transition-all"
                />
              </div>
              <button type="button" onClick={() => setShowSearch(false)} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-gray-100 pt-4 space-y-1">
            <Link href="/" className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#0066CC] rounded-lg hover:bg-blue-50" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link href="/search" className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#0066CC] rounded-lg hover:bg-blue-50" onClick={() => setMobileMenuOpen(false)}>
              Search
            </Link>
            {user && (
              <Link href="/admin" className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#0066CC] rounded-lg hover:bg-blue-50" onClick={() => setMobileMenuOpen(false)}>
                Admin
              </Link>
            )}
            {user && (
              <Link href="/profile" className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#0066CC] rounded-lg hover:bg-blue-50" onClick={() => setMobileMenuOpen(false)}>
                Profile
              </Link>
            )}
            {categories.length > 0 && (
              <div className="pt-2 border-t border-gray-100 mt-2">
                <p className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Categories</p>
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    href={`/category?name=${encodeURIComponent(cat)}`}
                    className="block px-4 py-2 text-sm text-gray-600 hover:text-[#0066CC] hover:bg-blue-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}
            <div className="pt-2 border-t border-gray-100 mt-2 px-4 py-2">
              <NewsletterButton variant="compact" />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
