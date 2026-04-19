'use client';

import { useState } from 'react';
import type { Ayah, SurahDetail, PanelTab } from '@/lib/types';
import TafsirView from './TafsirView';
import RecitePanel from './RecitePanel';

interface Props {
  surah: SurahDetail;
  selectedAyah: Ayah | null;
  playingAyahNumber: number | null;
  reciterId: string;
  onPlay: (ayah: Ayah) => void;
  onStop: () => void;
  onReciterChange: (id: string) => void;
}

const TABS: { key: Exclude<PanelTab, 'view'>; label: string }[] = [
  { key: 'tafsir', label: 'تفسير' },
  { key: 'recite', label: 'تلاوة' },
];

export default function RightPanel({
  surah,
  selectedAyah,
  playingAyahNumber,
  reciterId,
  onPlay,
  onStop,
  onReciterChange,
}: Props) {
  const [activeTab, setActiveTab] = useState<Exclude<PanelTab, 'view'>>('tafsir');

  return (
    <aside className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center border-b border-gray-100 dark:border-gray-800 px-4 shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3.5 text-sm font-medium transition-colors relative ${
              activeTab === tab.key
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#1A7A6E] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'tafsir' && (
          <TafsirView surahNumber={surah.number} surahName={surah.name} selectedAyah={selectedAyah} />
        )}
        {activeTab === 'recite' && (
          <RecitePanel
            ayahs={surah.ayahs}
            surahName={surah.name}
            playingAyahNumber={playingAyahNumber}
            reciterId={reciterId}
            onPlay={onPlay}
            onStop={onStop}
            onReciterChange={onReciterChange}
          />
        )}
      </div>
    </aside>
  );
}
