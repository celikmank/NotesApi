import type { Quit } from '../db/types';

export interface Elapsed {
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/** quit_date'ten `now`a kadar geçen süre. */
export function getElapsed(quit: Quit, now: number = Date.now()): Elapsed {
  const start = new Date(quit.quit_date).getTime();
  const totalSeconds = Math.max(0, Math.floor((now - start) / 1000));
  return {
    totalSeconds,
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
  };
}

/**
 * Biriken para = (geçen gün kesri) × günlük_miktar × birim_fiyat.
 * Sürekli (canlı) artması için gün kesri kullanılır — en güçlü dopamin unsuru.
 */
export function getMoneySaved(quit: Quit, now: number = Date.now()): number {
  const { totalSeconds } = getElapsed(quit, now);
  const dayFraction = totalSeconds / 86_400;
  return dayFraction * quit.daily_amount * quit.unit_cost;
}

/** Kaçınılan birim sayısı (ör. içilmeyen sigara). */
export function getUnitsAvoided(quit: Quit, now: number = Date.now()): number {
  const { totalSeconds } = getElapsed(quit, now);
  const dayFraction = totalSeconds / 86_400;
  return Math.floor(dayFraction * quit.daily_amount);
}

/** Para biçimlendirme. TRY için ₺ öne, mono rakamlar UI tarafında. */
export function formatMoney(amount: number, currency = 'TRY', locale = 'tr-TR'): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}
