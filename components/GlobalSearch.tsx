'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, BookOpen, FileText, AlignRight } from 'lucide-react';
import { fetchAllSurahs } from '@/lib/quranApi';
import type { Surah } from '@/lib/types';

type Filter = 'surah' | 'ayah' | 'tafsir';

interface Result {
  type: Filter;
  title: string;
  subtitle: string;
  href: string;
}

function normalize(str: string): string {
  return str
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ىئ]/g, 'ي')
    .replace(/ة/g, 'ه')
    .trim()
    .toLowerCase();
}

const FILTER_META: { key: Filter; label: string; icon: React.ReactNode }[] = [
  { key: 'surah',  label: 'سورة',  icon: <BookOpen size={13} />   },
  { key: 'ayah',   label: 'آية',   icon: <AlignRight size={13} /> },
  { key: 'tafsir', label: 'تفسير', icon: <FileText size={13} />   },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ open, onClose }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery]       = useState('');
  const [filter, setFilter]     = useState<Filter>('surah');
  const [surahs, setSurahs]     = useState<Surah[]>([]);
  const [results, setResults]   = useState<Result[]>([]);
  const [loading, setLoading]   = useState(false);
  const [active, setActive]     = useState(0);
  const tafsirTimer             = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load surahs list once
  useEffect(() => {
    fetchAllSurahs().then(setSurahs).catch(() => {});
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setActive(0);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Search logic
  const runSearch = useCallback(async (q: string, f: Filter) => {
    if (!q.trim()) { setResults([]); return; }
    const nq = normalize(q);

    if (f === 'surah') {
      const matched = surahs
        .filter(
          (s) =>
            normalize(s.name).includes(nq) ||
            s.englishName.toLowerCase().includes(nq) ||
            String(s.number) === q.trim()
        )
        .slice(0, 8)
        .map((s) => ({
          type: 'surah' as Filter,
          title: s.name,
          subtitle: `${s.englishName} · ${s.numberOfAyahs} آية`,
          href: `/surah/${s.number}`,
        }));
      setResults(matched);
      return;
    }

    if (f === 'ayah') {
      // Support formats: "2:5", "2 5", or just number
      const colonMatch = q.match(/^(\d+)[:\s](\d+)$/);
      if (colonMatch) {
        const surahNum = parseInt(colonMatch[1], 10);
        const ayahNum  = parseInt(colonMatch[2], 10);
        if (surahNum >= 1 && surahNum <= 114) {
          const surah = surahs.find((s) => s.number === surahNum);
          setResults([{
            type: 'ayah',
            title: `الآية ${ayahNum} من سورة ${surah?.name ?? surahNum}`,
            subtitle: `انتقل مباشرة إلى الآية`,
            href: `/surah/${surahNum}?ayah=${ayahNum}`,
          }]);
        } else {
          setResults([]);
        }
        return;
      }
      // Search surah by name to show "go to surah X"
      const matched = surahs
        .filter((s) => normalize(s.name).includes(nq) || s.englishName.toLowerCase().includes(nq))
        .slice(0, 6)
        .map((s) => ({
          type: 'ayah' as Filter,
          title: s.name,
          subtitle: `اكتب "${s.number}:رقم الآية" للانتقال مباشرة`,
          href: `/surah/${s.number}`,
        }));
      setResults(matched);
      return;
    }

    if (f === 'tafsir') {
      // Search by ayah keyword using alquran.cloud search endpoint
      if (tafsirTimer.current) clearTimeout(tafsirTimer.current);
      setLoading(true);
      tafsirTimer.current = setTimeout(async () => {
        try {
          const res = await fetch(
            `https://api.alquran.cloud/v1/search/${encodeURIComponent(q)}/all/ar`
          );
          if (!res.ok) throw new Error();
          const json = await res.json();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const matches: Result[] = (json.data?.matches ?? []).slice(0, 8).map((m: any) => ({
            type: 'tafsir' as Filter,
            title: `${m.surah.name} — الآية ${m.numberInSurah}`,
            subtitle: m.text?.slice(0, 80) ?? '',
            href: `/surah/${m.surah.number}?ayah=${m.numberInSurah}`,
          }));
          setResults(matches);
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 400);
      return;
    }
  }, [surahs]);

  useEffect(() => {
    runSearch(query, filter);
    setActive(0);
  }, [query, filter, runSearch]);

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      navigate(results[active].href);
    }
  }

  function navigate(href: string) {
    router.push(href);
    onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-xl mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input row */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              filter === 'surah'  ? 'ابحث عن سورة...'         :
              filter === 'ayah'   ? 'مثال: 2:5 أو اسم السورة' :
                                    'ابحث في نصوص القرآن...'
            }
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 text-gray-800 dark:text-gray-100"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
          {FILTER_META.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors font-medium ${
                filter === f.key
                  ? 'bg-[#1A7A6E] text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {loading && (
            <div className="flex gap-1.5 justify-center py-8">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 bg-[#1A7A6E] rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">لا توجد نتائج</p>
          )}

          {!loading && !query && (
            <p className="text-xs text-gray-400 text-center py-8">
              {filter === 'ayah'
                ? 'اكتب رقم السورة ثم ":" ثم رقم الآية — مثال: 2:255'
                : 'ابدأ الكتابة للبحث'}
            </p>
          )}

          {!loading && results.map((r, i) => (
            <button
              key={i}
              onClick={() => navigate(r.href)}
              onMouseEnter={() => setActive(i)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-right transition-colors ${
                i === active
                  ? 'bg-[#1A7A6E]/8 dark:bg-[#1A7A6E]/15'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div
                className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                  i === active ? 'bg-[#1A7A6E] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                }`}
              >
                {FILTER_META.find((f) => f.key === r.type)?.icon}
              </div>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                  {r.title}
                </p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{r.subtitle}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4 text-[11px] text-gray-400">
          <span>↑↓ للتنقل</span>
          <span>↵ للفتح</span>
          <span>Esc للإغلاق</span>
        </div>
      </div>
    </div>
  );
}
