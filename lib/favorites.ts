import type { Favorite } from './types';

const KEY = 'quran_favorites';

export function getFavorites(): Favorite[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function toggleFavorite(fav: Favorite): Favorite[] {
  const list = getFavorites();
  const idx = list.findIndex(
    (f) => f.surahNumber === fav.surahNumber && f.numberInSurah === fav.numberInSurah
  );
  const next = idx >= 0 ? list.filter((_, i) => i !== idx) : [...list, fav];
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function isFavorite(surahNumber: number, numberInSurah: number): boolean {
  return getFavorites().some(
    (f) => f.surahNumber === surahNumber && f.numberInSurah === numberInSurah
  );
}
