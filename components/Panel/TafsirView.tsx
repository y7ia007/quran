'use client';

import { useState, useEffect } from 'react';
import type { Ayah } from '@/lib/types';
import { fetchAyahTafsir } from '@/lib/quranApi';
import { ChevronDown, Copy, Check } from 'lucide-react';

const EDITIONS = [
  { id: 'ar.muyassar', label: 'الميسر'   },
  { id: 'ar.jalalayn', label: 'الجلالين' },
  { id: 'ar.waseet',   label: 'الوسيط'   },
];

interface Props {
  surahNumber: number;
  surahName: string;
  selectedAyah: Ayah | null;
}

export default function TafsirView({ surahNumber, surahName, selectedAyah }: Props) {
  const [edition, setEdition]   = useState(EDITIONS[0].id);
  const [tafsir, setTafsir]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [copied, setCopied]     = useState(false);

  useEffect(() => {
    if (!selectedAyah) { setTafsir(''); setError(''); return; }
    let cancelled = false;
    setLoading(true); setError(''); setTafsir('');
    fetchAyahTafsir(selectedAyah.number, edition)
      .then((t) => { if (!cancelled) setTafsir(t); })
      .catch(() => { if (!cancelled) setError('تعذّر تحميل التفسير، يرجى المحاولة مجدداً.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedAyah, edition]);

  function copyToClipboard(text: string): boolean {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.top = '0';
      ta.style.left = '0';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }

  function buildFullText() {
    if (!selectedAyah) return '';
    const editionLabel = EDITIONS.find((e) => e.id === edition)?.label ?? '';
    return [
      `📖 سورة ${surahName} — الآية ${selectedAyah.numberInSurah}`,
      `التفسير: ${editionLabel}`,
      '',
      selectedAyah.text,
      '',
      tafsir,
    ].join('\n');
  }

  function handleCopy() {
    if (!tafsir || !selectedAyah) return;
    const text = buildFullText();
    const success = copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } else {
      navigator.clipboard?.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }).catch(() => {});
    }
  }

  async function handleShare() {
    if (!tafsir || !selectedAyah) return;
    const text = buildFullText();
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // user cancelled or not supported — fall back to copy
        const ok = copyToClipboard(text);
        if (!ok) await navigator.clipboard?.writeText(text).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } else {
      const ok = copyToClipboard(text);
      if (!ok) await navigator.clipboard?.writeText(text).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  if (!selectedAyah) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#1A7A6E]/10 flex items-center justify-center">
          <span className="text-[#1A7A6E] text-2xl font-quran">ق</span>
        </div>
        <p className="font-semibold text-gray-700 dark:text-gray-200">التفسير</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
          اضغط على أي آية لعرض تفسيرها من مصادر موثوقة
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Ayah + controls header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs bg-[#1A7A6E]/10 text-[#1A7A6E] px-2.5 py-1 rounded-full font-medium">
            {surahNumber}:{selectedAyah.numberInSurah}
          </span>

          {/* Edition selector */}
          <div className="relative">
            <select
              value={edition}
              onChange={(e) => setEdition(e.target.value)}
              className="appearance-none bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300 rounded-lg px-3 py-1.5 pr-7 outline-none cursor-pointer"
            >
              {EDITIONS.map((e) => (
                <option key={e.id} value={e.id}>{e.label}</option>
              ))}
            </select>
            <ChevronDown size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <p className="font-quran text-lg leading-loose text-gray-800 dark:text-gray-200 text-right">
          {selectedAyah.text}
        </p>
      </div>

      {/* Tafsir body */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading && (
          <div className="flex gap-1.5 justify-center pt-10">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 bg-[#1A7A6E] rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
        {error && <p className="text-sm text-red-500 text-center pt-10">{error}</p>}
        {tafsir && !loading && (
          <p className="text-sm leading-[2] text-gray-700 dark:text-gray-300 text-right">
            {tafsir}
          </p>
        )}
      </div>

      {/* Footer: source + action buttons */}
      {tafsir && !loading && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-800 shrink-0 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {EDITIONS.find((e) => e.id === edition)?.label} — alquran.cloud
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          >
            {copied ? <Check size={13} className="text-[#1A7A6E]" /> : <Copy size={13} />}
            {copied ? 'تم النسخ' : 'نسخ التفسير'}
          </button>
        </div>
      )}
    </div>
  );
}
