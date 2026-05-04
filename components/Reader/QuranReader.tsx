'use client';

import { useState, useEffect } from 'react';
import type { Ayah, Favorite, SurahDetail } from '@/lib/types';
import { stripBasmala, revelationLabel } from '@/lib/quranApi';
import Bismillah from './Bismillah';
import AyahCard from './AyahCard';
import { Minus, Plus } from 'lucide-react';

interface Props {
  surah: SurahDetail;
  selectedAyah: Ayah | null;
  playingAyahNumber: number | null;
  doneAyahs: Set<number>;
  favorites: Favorite[];
  onSelect: (ayah: Ayah) => void;
  onPlay: (ayah: Ayah) => void;
  onToggleFavorite: (ayah: Ayah) => void;
}

const FONT_SIZES = [18, 22, 26, 30, 36, 42] as const;
type FontSize = (typeof FONT_SIZES)[number];
const DEFAULT_FONT: FontSize = 26;
const LS_KEY = 'quran_font_size';

export default function QuranReader({
  surah,
  selectedAyah,
  playingAyahNumber,
  doneAyahs,
  favorites,
  onSelect,
  onPlay,
  onToggleFavorite,
}: Props) {
  const [fontSize, setFontSize] = useState<FontSize>(DEFAULT_FONT);

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      const n = parseInt(saved, 10) as FontSize;
      if (FONT_SIZES.includes(n)) setFontSize(n);
    }
  }, []);

  function changeSize(delta: number) {
    setFontSize((prev) => {
      const idx = FONT_SIZES.indexOf(prev);
      const next = FONT_SIZES[Math.max(0, Math.min(FONT_SIZES.length - 1, idx + delta))];
      localStorage.setItem(LS_KEY, String(next));
      return next;
    });
  }

  // Surahs where we show a Bismillah header (not 1 = Al-Fatiha, not 9 = At-Tawba)
  const showBasmalaHeader = surah.number !== 1 && surah.number !== 9;
  const atMin = fontSize === FONT_SIZES[0];
  const atMax = fontSize === FONT_SIZES[FONT_SIZES.length - 1];

  return (
    <main className="h-full overflow-y-auto bg-white dark:bg-gray-900">
      {/* Sticky surah header */}
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#1A7A6E]/10 text-[#1A7A6E] text-xs font-bold flex items-center justify-center">
              {surah.number}
            </span>
            <div>
              <h1 className="font-quran text-base leading-none text-gray-900 dark:text-gray-100">
                {surah.name}
              </h1>
              <p className="text-[11px] text-gray-400 mt-0.5">{surah.englishName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Font size controls */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl px-1 py-1">
              <button
                onClick={() => changeSize(-1)}
                disabled={atMin}
                aria-label="تصغير النص"
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors
                  disabled:opacity-30 disabled:cursor-not-allowed
                  hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                <Minus size={13} />
              </button>
              <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500 w-6 text-center select-none">
                {FONT_SIZES.indexOf(fontSize) + 1}
              </span>
              <button
                onClick={() => changeSize(1)}
                disabled={atMax}
                aria-label="تكبير النص"
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors
                  disabled:opacity-30 disabled:cursor-not-allowed
                  hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                <Plus size={13} />
              </button>
            </div>

            {/* Revelation info */}
            <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1A7A6E]/50 inline-block" />
                {revelationLabel(surah.revelationType)}
              </span>
              <span>{surah.numberOfAyahs} آية</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-3 sm:px-6 pb-12">
        <div className="h-4" />
        {showBasmalaHeader && <Bismillah />}

        {surah.ayahs.map((ayah) => {
          const displayText =
            ayah.numberInSurah === 1 && showBasmalaHeader
              ? stripBasmala(ayah.text)
              : ayah.text;

          return (
            <AyahCard
              key={ayah.number}
              ayah={{ ...ayah, text: displayText }}
              surahNumber={surah.number}
              fontSize={fontSize}
              isSelected={selectedAyah?.numberInSurah === ayah.numberInSurah}
              isPlaying={playingAyahNumber === ayah.numberInSurah}
              isDone={doneAyahs.has(ayah.numberInSurah)}
              isFavorite={favorites.some(
                (f) => f.surahNumber === surah.number && f.numberInSurah === ayah.numberInSurah
              )}
              onSelect={onSelect}
              onPlay={onPlay}
              onToggleFavorite={onToggleFavorite}
            />
          );
        })}
      </div>
    </main>
  );
}
