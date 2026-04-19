import type { Surah, SurahDetail } from './types';

const BASE = 'https://api.alquran.cloud/v1';

export async function fetchAllSurahs(): Promise<Surah[]> {
  const res = await fetch(`${BASE}/surah`, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error('فشل تحميل قائمة السور');
  const json = await res.json();
  return json.data as Surah[];
}

export async function fetchSurah(id: number): Promise<SurahDetail> {
  const res = await fetch(`${BASE}/surah/${id}/quran-uthmani`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error('فشل تحميل السورة');
  const json = await res.json();
  return json.data as SurahDetail;
}

export async function fetchAyahTafsir(
  globalAyahNumber: number,
  edition = 'ar.muyassar'
): Promise<string> {
  const res = await fetch(`${BASE}/ayah/${globalAyahNumber}/${edition}`);
  if (!res.ok) throw new Error('فشل تحميل التفسير');
  const json = await res.json();
  return json.data.text as string;
}

/** Returns the surah number of the first ayah on a given Mushaf page (1–604) */
export async function fetchPageSurah(page: number): Promise<number> {
  const res = await fetch(`${BASE}/page/${page}/quran-uthmani`);
  if (!res.ok) throw new Error('فشل تحميل الصفحة');
  const json = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return json.data?.ayahs?.[0]?.surah?.number as number;
}

// ── Reciters ──────────────────────────────────────────────────────────────────
export interface Reciter {
  id: string;
  name: string;
  bitrate: number;
}

export const RECITERS: Reciter[] = [
  { id: 'ar.alafasy',             name: 'مشاري العفاسي',       bitrate: 128 },
  { id: 'ar.abdullahbasfar',      name: 'عبدالله بصفر',        bitrate: 192 },
  { id: 'ar.abdurrahmaansudais',  name: 'عبدالرحمن السديس',    bitrate: 192 },
  { id: 'ar.minshawi',            name: 'محمد المنشاوي',       bitrate: 128 },
  { id: 'ar.husary',              name: 'محمود خليل الحصري',   bitrate: 128 },
];

/** Build a CDN audio URL directly from reciter + global ayah number — no API call needed */
export function getAudioUrl(reciterId: string, globalAyahNumber: number, bitrate = 128): string {
  return `https://cdn.islamic.network/quran/audio/${bitrate}/${reciterId}/${globalAyahNumber}.mp3`;
}

// ── Bismillah stripping ───────────────────────────────────────────────────────
/**
 * The quran-uthmani edition prepends the Basmala text to the first ayah of every
 * surah (except Al-Fatiha and At-Tawba). This function strips that prefix so we
 * don't display it twice (once as the header, once inside the ayah text).
 *
 * Strategy: remove all Arabic diacritics (harakat) for matching, then map the
 * matched position back to the original string — avoids issues with shadda/fatha
 * ordering differences between source literals and API responses.
 */

// Unicode ranges for Arabic combining diacritics / harakat
const DIACRITIC_RE = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/gu;

export function stripBasmala(text: string): string {
  const bare = text.replace(DIACRITIC_RE, '');

  // Look for الرحيم (bare) near the start of the text
  // ٱ (U+0671) or ا (U+0627) depending on edition
  const ENDINGS_BARE = ['ٱلرحيم', 'الرحيم'];

  for (const endingBare of ENDINGS_BARE) {
    const barePos = bare.indexOf(endingBare);
    if (barePos < 0 || barePos > 80) continue;

    const targetBareEnd = barePos + endingBare.length;

    // Walk original text, counting bare (non-diacritic) characters until we
    // reach targetBareEnd, then take everything after that position.
    let bareCount = 0;
    for (let i = 0; i < text.length; i++) {
      const cp = text.codePointAt(i) ?? 0;
      const isDiacritic = (cp >= 0x0610 && cp <= 0x061A) ||
                          (cp >= 0x064B && cp <= 0x065F) ||
                          cp === 0x0670 ||
                          (cp >= 0x06D6 && cp <= 0x06DC) ||
                          (cp >= 0x06DF && cp <= 0x06E4) ||
                          cp === 0x06E7 || cp === 0x06E8 ||
                          (cp >= 0x06EA && cp <= 0x06ED);
      if (!isDiacritic) bareCount++;
      if (bareCount === targetBareEnd) {
        const rest = text.slice(i + 1).trim();
        if (rest.length > 0) return rest;
      }
    }
  }
  return text;
}

export function revelationLabel(type: string) {
  return type === 'Meccan' ? 'مكية' : 'مدنية';
}
