'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { BookOpen, AlignJustify, MessageSquare } from 'lucide-react';
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
  const [selectedAyah, setSelectedAyah]     = useState<Ayah | null>(null);
  const [playingAyahNumber, setPlaying]     = useState<number | null>(null);
  const [reciterId, setReciterId]           = useState(DEFAULT_RECITER);
  const [favorites, setFavorites]           = useState<Favorite[]>([]);
  const [doneAyahs, setDoneAyahs]           = useState<Set<number>>(new Set());
  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [panelOpen, setPanelOpen]           = useState(false);
  const [mobileTab, setMobileTab]           = useState<'reader' | 'sidebar' | 'panel'>('reader');
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
    setSidebarOpen(false);
    setPanelOpen(false);
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
    // Auto-open tafsir panel on mobile when an ayah is selected
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileTab('panel');
    }
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

  const sharedReaderProps = {
    surah, selectedAyah, playingAyahNumber,
    doneAyahs, favorites,
    onSelect: handleSelect, onPlay: playAyah, onToggleFavorite: handleToggleFavorite,
  };
  const sharedPanelProps = {
    surah, selectedAyah, playingAyahNumber, reciterId,
    onPlay: playAyah, onStop: stopAudio, onReciterChange: handleReciterChange,
  };

  return (
    <div className="relative h-[calc(100vh-3.5rem)] overflow-hidden">

      {/* ── Desktop: 3-column grid ─────────────────── */}
      <div
        className="hidden lg:grid h-full"
        style={{ gridTemplateColumns: '280px 1fr 340px' }}
      >
        <Sidebar surahs={allSurahs} currentSurah={currentSurah} />
        <QuranReader {...sharedReaderProps} />
        <RightPanel {...sharedPanelProps} />
      </div>

      {/* ── Mobile: tabbed layout ──────────────────── */}
      <div className="lg:hidden h-full flex flex-col pb-16">
        <div className={`flex-1 overflow-hidden ${mobileTab === 'reader' ? 'block' : 'hidden'}`}>
          <QuranReader {...sharedReaderProps} />
        </div>
        <div className={`flex-1 overflow-hidden ${mobileTab === 'sidebar' ? 'block' : 'hidden'}`}>
          <Sidebar surahs={allSurahs} currentSurah={currentSurah} />
        </div>
        <div className={`flex-1 overflow-hidden ${mobileTab === 'panel' ? 'block' : 'hidden'}`}>
          <RightPanel {...sharedPanelProps} />
        </div>
      </div>

      {/* ── Mobile: bottom navigation ──────────────── */}
      <nav className="lg:hidden absolute bottom-0 inset-x-0 z-50 h-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 flex items-center">
        {/* Left: Tafsir/Recite */}
        <button
          onClick={() => setMobileTab('panel')}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors ${mobileTab === 'panel' ? 'text-[#1A7A6E]' : 'text-gray-400 dark:text-gray-500'}`}
        >
          <MessageSquare size={20} />
          <span className="text-[11px] font-medium">تفسير</span>
        </button>

        {/* Center: Reader */}
        <button
          onClick={() => setMobileTab('reader')}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors ${mobileTab === 'reader' ? 'text-[#1A7A6E]' : 'text-gray-400 dark:text-gray-500'}`}
        >
          <BookOpen size={20} />
          <span className="text-[11px] font-medium">القرآن</span>
          {mobileTab === 'reader' && (
            <span className="absolute bottom-0 w-8 h-0.5 bg-[#1A7A6E] rounded-full" />
          )}
        </button>

        {/* Right: Surah list */}
        <button
          onClick={() => setMobileTab('sidebar')}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors ${mobileTab === 'sidebar' ? 'text-[#1A7A6E]' : 'text-gray-400 dark:text-gray-500'}`}
        >
          <AlignJustify size={20} />
          <span className="text-[11px] font-medium">السور</span>
        </button>
      </nav>

    </div>
  );
}
