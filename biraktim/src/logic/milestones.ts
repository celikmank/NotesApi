import type { Milestone } from '../db/types';

const HOUR = 3_600;
const DAY = 86_400;

/** Süre bazlı milestone eşikleri (saniye). */
export const TIME_MILESTONES_SECONDS: number[] = [
  1 * DAY, // 1 gün
  3 * DAY, // 3 gün
  7 * DAY, // 1 hafta
  14 * DAY, // 2 hafta
  30 * DAY, // 1 ay
  90 * DAY, // 3 ay
  180 * DAY, // 6 ay
  365 * DAY, // 1 yıl
  730 * DAY, // 2 yıl
];

/** Para bazlı milestone eşikleri (para birimi cinsinden). */
export const MONEY_MILESTONES: number[] = [100, 500, 1_000, 5_000, 10_000, 25_000];

/** Free planında yalnız ilk 3 milestone açıktır. */
export const FREE_MILESTONE_LIMIT = 3;

export interface MilestoneProgress {
  milestone: Milestone;
  progress: number; // 0..1
  remaining: number; // saniye ya da para, kind'e göre
}

/** Sıradaki (ulaşılmamış) en yakın süre milestone'u ve ilerlemesi. */
export function nextTimeMilestone(
  milestones: Milestone[],
  elapsedSeconds: number
): MilestoneProgress | null {
  const upcoming = milestones
    .filter((m) => m.kind === 'time' && m.achieved_at === null && m.threshold > elapsedSeconds)
    .sort((a, b) => a.threshold - b.threshold);

  const next = upcoming[0];
  if (!next) return null;

  return {
    milestone: next,
    progress: Math.min(1, elapsedSeconds / next.threshold),
    remaining: Math.max(0, next.threshold - elapsedSeconds),
  };
}

/** Süre milestone'unu insana okunur etikete çevirir (i18n dışı, sayısal). */
export function timeMilestoneLabel(seconds: number): string {
  if (seconds < DAY) return `${Math.round(seconds / HOUR)}h`;
  const days = Math.round(seconds / DAY);
  if (days < 30) return `${days}g`;
  if (days < 365) return `${Math.round(days / 30)}ay`;
  return `${Math.round(days / 365)}y`;
}
