'use client';

import { useState } from 'react';
import type { Ayah } from '@/lib/types';
import { Copy, Bookmark, BookmarkCheck, Check, Play, Pause, Volume2 } from 'lucide-react';

interface Props {
  ayah: Ayah;
  surahNumber: number;
  isSelected: boolean;
  isPlaying: boolean;
  isDone: boolean;
  isFavorite: boolean;
  onSelect: (ayah: Ayah) => void;
  onPlay: (ayah: Ayah) => void;
  onToggleFavorite: (ayah: Ayah) => void;
}

export default function AyahCard({
  ayah,
  surahNumber,
  isSelected,
  isPlaying,
  isDone,
  isFavorite,
  onSelect,
  onPlay,
  onToggleFavorite,
}: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      const ta = document.createElement('textarea');
      ta.value = ayah.text;
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch {
      navigator.clipboard?.writeText(ayah.text).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleFavorite(e: React.MouseEvent) {
    e.stopPropagation();
    onToggleFavorite(ayah);
  }

  function handlePlay(e: React.MouseEvent) {
    e.stopPropagation();
    onPlay(ayah);
  }

  const highlighted = isSelected || isPlaying;

  return (
    <div
      id={`ayah-${ayah.numberInSurah}`}
      onClick={() => onSelect(ayah)}
      className={`group relative rounded-2xl px-5 pt-4 pb-3 mb-1 cursor-pointer transition-all duration-150 ${
        isPlaying
          ? 'bg-[#1A7A6E]/10 border border-[#1A7A6E]/30'
          : isSelected
          ? 'bg-[#1A7A6E]/6 border border-[#1A7A6E]/20'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent'
      }`}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        {/* Ayah number / state badge */}
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium shrink-0 transition-colors ${
            isPlaying
              ? 'bg-[#1A7A6E] text-white'
              : isDone
              ? 'bg-[#1A7A6E]/15 text-[#1A7A6E]'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:bg-[#1A7A6E]/10 group-hover:text-[#1A7A6E]'
          }`}
        >
          {isPlaying
            ? <Volume2 size={13} className="animate-pulse" />
            : isDone
            ? <Check size={13} />
            : <span className="text-xs">{ayah.numberInSurah}</span>}
        </div>

        {/* Toolbar — shown on hover or when highlighted */}
        <div
          className={`flex items-center gap-0.5 transition-opacity ${
            highlighted ? 'opacity-100' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100'
          }`}
        >
          {/* Play / Pause button */}
          <ToolBtn onClick={handlePlay} label={isPlaying ? 'إيقاف' : 'تشغيل'}>
            {isPlaying
              ? <Pause size={13} className="text-[#1A7A6E]" />
              : <Play size={13} />}
          </ToolBtn>

          {/* Copy */}
          <ToolBtn onClick={handleCopy} label="نسخ">
            {copied
              ? <Check size={13} className="text-[#1A7A6E]" />
              : <Copy size={13} />}
          </ToolBtn>

          {/* Bookmark */}
          <ToolBtn onClick={handleFavorite} label="إشارة">
            {isFavorite
              ? <BookmarkCheck size={13} className="text-[#1A7A6E]" />
              : <Bookmark size={13} />}
          </ToolBtn>
        </div>
      </div>

      {/* Arabic text */}
      <p className="font-quran text-xl sm:text-2xl leading-[2.4] text-right text-gray-900 dark:text-gray-100 select-text">
        {ayah.text}
      </p>

      {/* Reference tag */}
      {highlighted && (
        <div className="mt-1.5 flex justify-start">
          <span className="text-xs text-[#1A7A6E]/60 font-medium tabular-nums">
            {surahNumber}:{ayah.numberInSurah}
          </span>
        </div>
      )}
    </div>
  );
}

function ToolBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
    >
      {children}
    </button>
  );
}
