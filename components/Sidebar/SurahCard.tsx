import type { Surah } from '@/lib/types';
import { revelationLabel } from '@/lib/quranApi';
import SurahIllustration from './SurahIllustration';

interface Props {
  surah: Surah;
}

export default function SurahCard({ surah }: Props) {
  return (
    <div className="mx-3 mb-4">
      <SurahIllustration surahNumber={surah.number} className="rounded-xl h-36" />

      <div className="mt-3 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{surah.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{surah.englishName}</p>
        </div>
        <div className="text-left text-sm text-gray-500 dark:text-gray-400">
          <div>{revelationLabel(surah.revelationType)}</div>
          <div>{surah.numberOfAyahs} آية</div>
        </div>
      </div>
    </div>
  );
}
