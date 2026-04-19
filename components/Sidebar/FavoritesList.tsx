'use client';

import Link from 'next/link';
import type { Favorite } from '@/lib/types';
import { Bookmark, Trash2 } from 'lucide-react';
import { toggleFavorite } from '@/lib/favorites';

interface Props {
  favorites: Favorite[];
  onUpdate: (next: Favorite[]) => void;
}

export default function FavoritesList({ favorites, onUpdate }: Props) {
  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3 px-4 text-center py-12">
        <Bookmark size={32} className="text-gray-300 dark:text-gray-600" />
        <p className="text-sm text-gray-400 dark:text-gray-500">
          لا توجد آيات محفوظة بعد
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          اضغط على أيقونة الإشارة في أي آية لحفظها
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2 pt-1">
      {favorites.map((fav) => (
        <div
          key={`${fav.surahNumber}-${fav.numberInSurah}`}
          className="group bg-gray-50 dark:bg-gray-800 rounded-xl p-3 relative"
        >
          <Link href={`/surah/${fav.surahNumber}`} className="block">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs bg-[#1A7A6E]/10 text-[#1A7A6E] px-2 py-0.5 rounded-full font-medium">
                {fav.surahNumber}:{fav.numberInSurah}
              </span>
              <span className="text-xs text-gray-400">{fav.surahName}</span>
            </div>
            <p className="font-quran text-base leading-loose text-gray-800 dark:text-gray-200 text-right line-clamp-2">
              {fav.text}
            </p>
          </Link>
          <button
            onClick={() => onUpdate(toggleFavorite(fav))}
            className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
