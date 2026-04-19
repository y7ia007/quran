'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Surah, SidebarTab, Favorite } from '@/lib/types';
import { fetchPageSurah } from '@/lib/quranApi';
import { getFavorites } from '@/lib/favorites';
import SurahCard from './SurahCard';
import SearchBar from './SearchBar';
import SurahList from './SurahList';
import JuzList from './JuzList';
import FavoritesList from './FavoritesList';

interface Props {
  surahs: Surah[];
  currentSurah: Surah;
}

const TABS: SidebarTab[] = ['سورة', 'جزء', 'صفحة', 'مفضلة'];

export default function Sidebar({ surahs, currentSurah }: Props) {
  const router = useRouter();
  const [query, setQuery]           = useState('');
  const [activeTab, setActiveTab]   = useState<SidebarTab>('سورة');
  const [favorites, setFavorites]   = useState<Favorite[]>([]);
  const [loadingPage, setLoadingPage] = useState<number | null>(null);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  function handleTabChange(tab: SidebarTab) {
    setActiveTab(tab);
    if (tab === 'مفضلة') setFavorites(getFavorites());
  }

  async function goToPage(page: number) {
    setLoadingPage(page);
    try {
      const surahNum = await fetchPageSurah(page);
      if (surahNum) router.push(`/surah/${surahNum}`);
    } catch {
      // silently ignore
    } finally {
      setLoadingPage(null);
    }
  }

  return (
    <aside className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Fixed header */}
      <div className="pt-4 flex flex-col gap-3 shrink-0">
        <SurahCard surah={currentSurah} />
        {activeTab === 'سورة' && <SearchBar value={query} onChange={setQuery} />}

        {/* Tabs */}
        <div className="flex items-center gap-0.5 px-3">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-[#1A7A6E] text-white'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      {activeTab === 'سورة' && (
        <SurahList surahs={surahs} currentId={currentSurah.number} query={query} />
      )}

      {activeTab === 'جزء' && (
        <JuzList currentSurahNumber={currentSurah.number} />
      )}

      {activeTab === 'صفحة' && (
        <div className="flex-1 overflow-y-auto px-3 pb-4 pt-2">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 px-1">
            اضغط على رقم الصفحة للانتقال إليها
          </p>
          <div className="grid grid-cols-5 gap-1">
            {Array.from({ length: 604 }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                disabled={loadingPage !== null}
                className={`rounded-lg py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                  loadingPage === p
                    ? 'bg-[#1A7A6E] text-white animate-pulse'
                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-[#1A7A6E]/10 hover:text-[#1A7A6E] text-gray-600 dark:text-gray-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'مفضلة' && (
        <FavoritesList favorites={favorites} onUpdate={setFavorites} />
      )}
    </aside>
  );
}
