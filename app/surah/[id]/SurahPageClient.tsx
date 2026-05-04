'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { BookOpen, AlignJustify, MessageSquare, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Ayah, Favorite, Surah, SurahDetail } from '@/lib/types';
import { getFavorites, toggleFavorite } from '@/lib/favorites';
import { getAudioUrl, RECITERS } from '@/lib/quranApi';
import Sidebar from '@/components/Sidebar/Sidebar';
import QuranReader from '@/components/Reader/QuranReader';
import RightPanel from '@/components/Panel/RightPanel';

interface Props {
  surah: SurahDetail;
  allSurahs: Surah[];
  initialAyah?: number;
}

const DEFAULT_RECITER = RECITERS[0].id;

export default function SurahPageClient({ surah, allSurahs, initialAyah }: Props) {
  const router = useRouter();
  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
  const [playingAyahNumber, setPlaying]  = useState<number | null>(null);
  const [reciterId, setReciterId]        = useState(DEFAULT_RECITER);
  const [favorites, setFavorites]        = useState<Favorite[]>([]);
  const [doneAyahs, setDoneAyahs]        = useState<Set<number>>(new Set());
  const [mobileTab, setMobileTab]        = useState<'sidebar' | 'reader' | 'panel'>('reader');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setFavorites(getFavorites());
    const saved = localStorage.getItem('quran_reciter');
    if (saved) setReciterId(saved);
  }, []);

  useEffect(() => {
    stopAudio();
    setSelectedAyah(null);
    setDoneAyahs(new Set());
    setMobileTab('reader');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surah.number]);

  useEffect(() => {
    if (!initialAyah) return;
    const target = surah.ayahs.find((a) => a.numberInSurah === initialAyah);
    if (!target) return;
    setSelectedAyah(target);
    const timer = setTimeout(() => {
      document.getElementById(`ayah-${initialAyah}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAyah, surah.number]);

  function killAudio() {
    if (audioRef.current) {
      const a = audioRef.current;
      a.onended = null; a.pause(); a.src = '';
      audioRef.current = null;
    }
  }
  function stopAudio() { killAudio(); setPlaying(null); }

  const playAyah = useCallback((ayah: Ayah) => {
    if (playingAyahNumber === ayah.numberInSurah) { stopAudio(); return; }
    killAudio();
    const reciter = RECITERS.find((r) => r.id === reciterId) ?? RECITERS[0];
    const audio = new Audio(getAudioUrl(reciterId, ayah.number, reciter.bitrate));
    audioRef.current = audio;
    setPlaying(ayah.numberInSurah);
    audio.play().catch(() => setPlaying(null));
    audio.onended = () => {
      setPlaying(null);
      setDoneAyahs((prev) => new Set(prev).add(ayah.numberInSurah));
      window.dispatchEvent(new CustomEvent('ayah-ended', { detail: { surahAyahNum: ayah.numberInSurah } }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reciterId, playingAyahNumber]);

  const handleSelect = useCallback((ayah: Ayah) => {
    setSelectedAyah((prev) => prev?.numberInSurah === ayah.numberInSurah ? null : ayah);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) setMobileTab('panel');
  }, []);

  const handleToggleFavorite = useCallback((ayah: Ayah) => {
    setFavorites(toggleFavorite({
      surahNumber: surah.number, surahName: surah.name,
      numberInSurah: ayah.numberInSurah, globalNumber: ayah.number, text: ayah.text,
    }));
  }, [surah]);

  const handleReciterChange = useCallback((id: string) => {
    setReciterId(id);
    localStorage.setItem('quran_reciter', id);
    stopAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentSurah = allSurahs.find((s) => s.number === surah.number) ?? allSurahs[0];

  const readerProps = {
    surah, selectedAyah, playingAyahNumber, doneAyahs, favorites,
    onSelect: handleSelect, onPlay: playAyah, onToggleFavorite: handleToggleFavorite,
  };
  const panelProps = {
    surah, selectedAyah, playingAyahNumber, reciterId,
    onPlay: playAyah, onStop: stopAudio, onReciterChange: handleReciterChange,
  };

  return (
    <>
      {/* ── Desktop: 3-column grid ──────────────────────────── */}
      <div
        className="hidden lg:grid h-[calc(100vh-3.5rem)]"
        style={{ gridTemplateColumns: '280px 1fr 340px' }}
      >
        <Sidebar surahs={allSurahs} currentSurah={currentSurah} />
        <QuranReader {...readerProps} />
        <RightPanel {...panelProps} />
      </div>

      {/* ── Mobile: tabbed layout ───────────────────────────── */}
      <div className="lg:hidden" style={{ height: 'calc(100dvh - 3.5rem - 4rem)' }}>

        {/* Mobile top bar (back button + surah name) */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => router.push('/')}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="عودة"
          >
            <ArrowRight size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-quran text-base text-gray-900 dark:text-white truncate leading-none">
              {surah.name}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">{surah.englishName} · {surah.numberOfAyahs} آية</p>
          </div>
          {/* Active tab label */}
          <span className="text-xs text-[#1A7A6E] font-medium bg-[#1A7A6E]/10 px-2 py-0.5 rounded-full">
            {mobileTab === 'sidebar' ? 'السور' : mobileTab === 'reader' ? 'القرآن' : 'التفسير'}
          </span>
        </div>

        {/* Tab content */}
        <div className="h-[calc(100%-52px)] overflow-hidden">
          <div className={`h-full ${mobileTab === 'sidebar' ? 'block' : 'hidden'}`}>
            <Sidebar surahs={allSurahs} currentSurah={currentSurah} />
          </div>
          <div className={`h-full ${mobileTab === 'reader' ? 'block' : 'hidden'}`}>
            <QuranReader {...readerProps} />
          </div>
          <div className={`h-full ${mobileTab === 'panel' ? 'block' : 'hidden'}`}>
            <RightPanel {...panelProps} />
          </div>
        </div>
      </div>

      {/* ── Mobile: fixed bottom navigation ────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-[200] h-16
          bg-white/95 dark:bg-gray-900/95 backdrop-blur-md
          border-t border-gray-200 dark:border-gray-800
          flex items-center safe-area-inset-bottom"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* السور — first (rightmost in RTL) */}
        <button
          onClick={() => setMobileTab('sidebar')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors
            ${mobileTab === 'sidebar' ? 'text-[#1A7A6E]' : 'text-gray-400 dark:text-gray-500'}`}
        >
          <AlignJustify size={21} />
          <span className="text-[11px] font-medium">السور</span>
          {mobileTab === 'sidebar' && <span className="absolute top-0 inset-x-0 mx-auto w-8 h-0.5 bg-[#1A7A6E] rounded-full" />}
        </button>

        {/* القرآن — center */}
        <button
          onClick={() => setMobileTab('reader')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors
            ${mobileTab === 'reader' ? 'text-[#1A7A6E]' : 'text-gray-400 dark:text-gray-500'}`}
        >
          <BookOpen size={21} />
          <span className="text-[11px] font-medium">القرآن</span>
          {mobileTab === 'reader' && <span className="absolute top-0 inset-x-0 mx-auto w-8 h-0.5 bg-[#1A7A6E] rounded-full" />}
        </button>

        {/* التفسير — last (leftmost in RTL) */}
        <button
          onClick={() => setMobileTab('panel')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors
            ${mobileTab === 'panel' ? 'text-[#1A7A6E]' : 'text-gray-400 dark:text-gray-500'}`}
        >
          <MessageSquare size={21} />
          <span className="text-[11px] font-medium">التفسير</span>
          {mobileTab === 'panel' && <span className="absolute top-0 inset-x-0 mx-auto w-8 h-0.5 bg-[#1A7A6E] rounded-full" />}
        </button>
      </nav>
    </>
  );
}
