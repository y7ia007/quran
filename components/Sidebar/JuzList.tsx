import Link from 'next/link';
import { JUZ_DATA } from '@/lib/juzData';

interface Props {
  currentSurahNumber: number;
}

export default function JuzList({ currentSurahNumber }: Props) {
  return (
    <div className="flex-1 overflow-y-auto px-3 pb-4">
      <div className="grid grid-cols-2 gap-2 pt-1">
        {JUZ_DATA.map((juz) => {
          const isActive = currentSurahNumber === juz.startSurah;
          return (
            <Link
              key={juz.number}
              href={`/surah/${juz.startSurah}?ayah=${juz.startAyah}`}
              className={`flex items-center gap-2.5 rounded-xl py-2.5 px-3 transition-colors ${
                isActive
                  ? 'bg-[#1A7A6E] text-white'
                  : 'bg-gray-50 dark:bg-gray-800 hover:bg-[#1A7A6E]/10 text-gray-700 dark:text-gray-300'
              }`}
            >
              {/* رقم الجزء */}
              <span
                className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-[#1A7A6E]/10 text-[#1A7A6E]'
                }`}
              >
                {juz.number}
              </span>

              {/* النص */}
              <div className="min-w-0 flex flex-col">
                <span className={`text-[10px] leading-none mb-0.5 ${isActive ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'}`}>
                  الجزء {juz.number}
                </span>
                <span className="font-quran text-sm leading-snug truncate">
                  {juz.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
