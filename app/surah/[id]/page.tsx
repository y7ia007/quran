import { notFound } from 'next/navigation';
import { fetchAllSurahs, fetchSurah } from '@/lib/quranApi';
import SurahPageClient from './SurahPageClient';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ayah?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const num = parseInt(id, 10);
  if (isNaN(num) || num < 1 || num > 114) return {};
  const surahs = await fetchAllSurahs();
  const surah = surahs.find((s) => s.number === num);
  return { title: surah ? `سورة ${surah.name} — القرآن الكريم` : 'القرآن الكريم' };
}

export default async function SurahPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { ayah } = await searchParams;
  const num = parseInt(id, 10);
  if (isNaN(num) || num < 1 || num > 114) notFound();

  const [surah, allSurahs] = await Promise.all([
    fetchSurah(num),
    fetchAllSurahs(),
  ]);

  const initialAyah = ayah ? parseInt(ayah, 10) : undefined;

  return <SurahPageClient surah={surah} allSurahs={allSurahs} initialAyah={initialAyah} />;
}
