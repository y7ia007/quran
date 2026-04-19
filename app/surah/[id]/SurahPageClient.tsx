'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
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

const DEFAULT_RECITER = RECITERS[0].id; // مشاري العفاسي

export default function SurahPageClient({ surah, allSurahs, initialAyah }: Props) {
  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
  const [playingAyahNumber, setPlayingAyahNumber] = useState<number | null>(null);
  const [reciterId, setReciterId] = useState(DEFAULT_RECITER);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [doneAyahs, setDoneAyahs] = useState<Set<number>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load saved reciter + favorites on mount
  useEffect(() => {
    setFavorites(getFavorites());
    const saved = localStorage.getItem('quran_reciter');
    if (saved) setReciterId(saved);
  }, []);

  // Reset state when navigating to a different surah
  useEffect(() => {
    stopAudio();
    setSelectedAyah(null);
    setDoneAyahs(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surah.number]);

  // Auto-select & scroll to initialAyah (e.g. from juz navigation)
  useEffect(() => {
    if (!initialAyah) return;
    const target = surah.ayahs.find((a) => a.numberInSurah === initialAyah);
    if (!target) return;
    setSelectedAyah(target);
    // Delay scroll until DOM renders
    const timer = setTimeout(() => {
      const el = document.getElementById(`ayah-${initialAyah}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAyah, surah.number]);

  /** Hard-stop: pause + clear src so the browser releases the network request */
  function killAudio() {
    if (audioRef.current) {
      const a = audioRef.current;
      a.onended = null;
      a.pause();
      a.src = '';   // forces the browser to abort buffering immediately
      audioRef.current = null;
    }
  }

  function stopAudio() {
    killAudio();
    setPlayingAyahNumber(null);
  }

  const playAyah = useCallback(
    (ayah: Ayah) => {
      // Same ayah → toggle off
      if (playingAyahNumber === ayah.numberInSurah) {
        stopAudio();
        return;
      }

      // Hard-stop whatever is currently playing
      killAudio();

      const reciter = RECITERS.find((r) => r.id === reciterId) ?? RECITERS[0];
      const url = getAudioUrl(reciterId, ayah.number, reciter.bitrate);
      const audio = new Audio(url);
      audioRef.current = audio;

      // Mark as playing BEFORE play() so UI updates instantly
      setPlayingAyahNumber(ayah.numberInSurah);

      audio.play().catch(() => setPlayingAyahNumber(null));

      audio.onended = () => {
        setPlayingAyahNumber(null);
        // Mark this ayah as completed
        setDoneAyahs((prev) => new Set(prev).add(ayah.numberInSurah));
        window.dispatchEvent(
          new CustomEvent('ayah-ended', { detail: { surahAyahNum: ayah.numberInSurah } })
        );
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reciterId, playingAyahNumber]
  );

  // Clicking an ayah = select only (no auto-play)
  const handleSelect = useCallback((ayah: Ayah) => {
    setSelectedAyah((prev) =>
      prev?.numberInSurah === ayah.numberInSurah ? null : ayah
    );
  }, []);

  const handleToggleFavorite = useCallback(
    (ayah: Ayah) => {
      const fav: Favorite = {
        surahNumber: surah.number,
        surahName: surah.name,
        numberInSurah: ayah.numberInSurah,
        globalNumber: ayah.number,
        text: ayah.text,
      };
      setFavorites(toggleFavorite(fav));
    },
    [surah]
  );

  const handleReciterChange = useCallback((id: string) => {
    setReciterId(id);
    localStorage.setItem('quran_reciter', id);
    stopAudio(); // stop current playback when switching reciter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentSurah = allSurahs.find((s) => s.number === surah.number) ?? allSurahs[0];

  return (
    <div
      className="grid h-[calc(100vh-3.5rem)]"
      style={{ gridTemplateColumns: '280px 1fr 340px' }}
    >
      <Sidebar surahs={allSurahs} currentSurah={currentSurah} />
      <QuranReader
        surah={surah}
        selectedAyah={selectedAyah}
        playingAyahNumber={playingAyahNumber}
        doneAyahs={doneAyahs}
        favorites={favorites}
        onSelect={handleSelect}
        onPlay={playAyah}
        onToggleFavorite={handleToggleFavorite}
      />
      <RightPanel
        surah={surah}
        selectedAyah={selectedAyah}
        playingAyahNumber={playingAyahNumber}
        reciterId={reciterId}
        onPlay={playAyah}
        onStop={stopAudio}
        onReciterChange={handleReciterChange}
      />
    </div>
  );
}
