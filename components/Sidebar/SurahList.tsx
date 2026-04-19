'use client';

import Link from 'next/link';
import type { Surah } from '@/lib/types';
import { revelationLabel } from '@/lib/quranApi';

interface Props {
  surahs: Surah[];
  currentId: number;
  query: string;
}

/** Strip Arabic diacritics and normalize alef variants for fuzzy matching */
function normalize(str: string): string {
  return str
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, '') // diacritics
    .replace(/[أإآٱ]/g, 'ا') // alef variants → bare alef
    .replace(/[ىئ]/g, 'ي')  // ya variants
    .replace(/ة/g, 'ه')      // ta marbuta → ha
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export default function SurahList({ surahs, currentId, query }: Props) {
  const q = normalize(query);
  const filtered = q
    ? surahs.filter(
        (s) =>
          normalize(s.name).includes(q) ||
          s.englishName.toLowerCase().includes(q) ||
          String(s.number).includes(q)
      )
    : surahs;

  return (
    <div className="flex-1 overflow-y-auto px-3 pb-4">
      {filtered.map((surah) => (
        <Link
          key={surah.number}
          href={`/surah/${surah.number}`}
          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl mb-0.5 transition-colors group ${
            surah.number === currentId
              ? 'bg-[#1A7A6E]/10 text-[#1A7A6E]'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`text-sm font-mono w-6 text-center ${
                surah.number === currentId ? 'text-[#1A7A6E]' : 'text-gray-400'
              }`}
            >
              {surah.number}
            </span>
            <span className="font-medium text-sm">{surah.name}</span>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {revelationLabel(surah.revelationType)}
          </span>
        </Link>
      ))}
    </div>
  );
}
