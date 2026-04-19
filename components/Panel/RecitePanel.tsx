'use client';

import { useEffect } from 'react';
import type { Ayah } from '@/lib/types';
import { RECITERS } from '@/lib/quranApi';
import { Play, Pause, SkipBack, SkipForward, ChevronDown } from 'lucide-react';

interface Props {
  ayahs: Ayah[];
  surahName: string;
  playingAyahNumber: number | null;
  reciterId: string;
  onPlay: (ayah: Ayah) => void;
  onStop: () => void;
  onReciterChange: (id: string) => void;
}

export default function RecitePanel({
  ayahs,
  surahName,
  playingAyahNumber,
  reciterId,
  onPlay,
  onStop,
  onReciterChange,
}: Props) {
  const currentIndex =
    playingAyahNumber != null
      ? ayahs.findIndex((a) => a.numberInSurah === playingAyahNumber)
      : -1;

  const displayAyah = currentIndex >= 0 ? ayahs[currentIndex] : ayahs[0];
  const isPlaying = playingAyahNumber != null;

  function togglePlay() {
    isPlaying ? onStop() : onPlay(displayAyah);
  }

  function prev() {
    if (currentIndex > 0) onPlay(ayahs[currentIndex - 1]);
  }

  function next() {
    if (currentIndex >= 0 && currentIndex < ayahs.length - 1)
      onPlay(ayahs[currentIndex + 1]);
    else onStop();
  }

  // Auto-advance when ayah ends (event dispatched from SurahPageClient)
  useEffect(() => {
    const handler = (e: CustomEvent<{ surahAyahNum: number }>) => {
      const idx = ayahs.findIndex((a) => a.numberInSurah === e.detail.surahAyahNum);
      if (idx >= 0 && idx < ayahs.length - 1) onPlay(ayahs[idx + 1]);
      else onStop();
    };
    window.addEventListener('ayah-ended' as never, handler as EventListener);
    return () => window.removeEventListener('ayah-ended' as never, handler as EventListener);
  }, [ayahs, onPlay, onStop]);

  const progress =
    currentIndex >= 0 ? (currentIndex / Math.max(ayahs.length - 1, 1)) * 100 : 0;

  const currentReciter = RECITERS.find((r) => r.id === reciterId) ?? RECITERS[0];

  return (
    <div className="flex flex-col h-full px-5 py-5 gap-5">
      {/* Reciter selector */}
      <div className="shrink-0">
        <p className="text-xs text-gray-400 mb-1.5">القارئ</p>
        <div className="relative">
          <select
            value={reciterId}
            onChange={(e) => onReciterChange(e.target.value)}
            className="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-200 outline-none pr-8 cursor-pointer"
          >
            {RECITERS.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Ayah display */}
      <div className="flex-1 flex flex-col justify-center gap-5">
        <div className="bg-[#1A7A6E]/5 dark:bg-[#1A7A6E]/10 rounded-2xl p-5 text-center border border-[#1A7A6E]/10">
          <p className="font-quran text-xl leading-loose text-gray-800 dark:text-gray-200 line-clamp-4">
            {displayAyah?.text ?? '—'}
          </p>
          <p className="text-xs text-[#1A7A6E] mt-2 font-medium">
            {surahName} — الآية {displayAyah?.numberInSurah}
          </p>
        </div>

        {/* Progress */}
        <div>
          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1A7A6E] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{displayAyah?.numberInSurah ?? 1}</span>
            <span>{ayahs.length} آية</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={prev}
            disabled={currentIndex <= 0}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-25 transition-colors text-gray-600 dark:text-gray-400"
          >
            <SkipForward size={20} />
          </button>
          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-2xl bg-[#1A7A6E] text-white flex items-center justify-center hover:bg-[#155f55] transition-colors shadow-lg shadow-[#1A7A6E]/25"
          >
            {isPlaying ? <Pause size={22} /> : <Play size={22} className="-mr-0.5" />}
          </button>
          <button
            onClick={next}
            disabled={currentIndex >= ayahs.length - 1}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-25 transition-colors text-gray-600 dark:text-gray-400"
          >
            <SkipBack size={20} />
          </button>
        </div>

        <p className="text-center text-xs text-gray-400">{currentReciter.name}</p>
      </div>
    </div>
  );
}
