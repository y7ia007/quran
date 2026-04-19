export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: 'Meccan' | 'Medinan';
  numberOfAyahs: number;
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  audio?: string;
  juz?: number;
  page?: number;
}

export interface SurahDetail extends Surah {
  ayahs: Ayah[];
}

export interface Favorite {
  surahNumber: number;
  surahName: string;
  numberInSurah: number;
  globalNumber: number;
  text: string;
}

export type PanelTab = 'view' | 'tafsir' | 'recite';
export type SidebarTab = 'سورة' | 'جزء' | 'صفحة' | 'مفضلة';
