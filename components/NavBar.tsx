'use client';

import { useState, useEffect } from 'react';
import { Home, Moon, Sun, Search } from 'lucide-react';
import Link from 'next/link';
import GlobalSearch from './GlobalSearch';

export default function NavBar() {
  const [dark, setDark]           = useState(false);
  const [searchOpen, setSearch]   = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      document.documentElement.classList.add('dark');
      setDark(true);
    }
  }, []);

  // Global keyboard shortcut: Ctrl/Cmd + K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  return (
    <>
      <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-6 gap-4 sticky top-0 z-50">
        {/* Logo */}
        <Link href="/" className="text-[#1A7A6E] font-bold text-lg tracking-tight">
          القرآن
        </Link>

        {/* Home nav */}
        <nav className="flex items-center gap-1 mx-auto">
          <Link
            href="/"
            aria-label="الرئيسية"
            className="p-2 rounded-lg transition-colors relative text-[#1A7A6E]"
          >
            <Home size={18} />
            <span className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#1A7A6E] rounded-full" />
          </Link>
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-1">
          {/* Search button */}
          <button
            onClick={() => setSearch(true)}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl px-3 py-1.5 transition-colors"
          >
            <Search size={15} />
            <span className="hidden sm:inline">بحث</span>
            <kbd className="hidden sm:inline text-[10px] bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-1 py-0.5 font-mono text-gray-400">
              ⌘K
            </kbd>
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDark}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
            aria-label="تبديل الوضع"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <GlobalSearch open={searchOpen} onClose={() => setSearch(false)} />
    </>
  );
}
