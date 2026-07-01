import type { QuitType } from '../db/types';

export interface QuitTypePreset {
  type: QuitType;
  emoji: string;
  /** Onboarding 2. adım için varsayılanlar (kullanıcı düzenler). */
  defaultDailyAmount: number;
  defaultUnitCost: number;
  /** Sağlık zaman çizelgesi yalnız sigara için gösterilir. */
  hasHealthTimeline: boolean;
}

export const QUIT_PRESETS: QuitTypePreset[] = [
  { type: 'smoking', emoji: '🚬', defaultDailyAmount: 20, defaultUnitCost: 4, hasHealthTimeline: true },
  { type: 'alcohol', emoji: '🍺', defaultDailyAmount: 2, defaultUnitCost: 40, hasHealthTimeline: false },
  { type: 'sugar', emoji: '🍬', defaultDailyAmount: 1, defaultUnitCost: 25, hasHealthTimeline: false },
  { type: 'social_media', emoji: '📱', defaultDailyAmount: 0, defaultUnitCost: 0, hasHealthTimeline: false },
  { type: 'gambling', emoji: '🎰', defaultDailyAmount: 1, defaultUnitCost: 100, hasHealthTimeline: false },
  { type: 'energy_drink', emoji: '⚡', defaultDailyAmount: 1, defaultUnitCost: 35, hasHealthTimeline: false },
  { type: 'fast_food', emoji: '🍔', defaultDailyAmount: 1, defaultUnitCost: 150, hasHealthTimeline: false },
  { type: 'gaming', emoji: '🎮', defaultDailyAmount: 0, defaultUnitCost: 0, hasHealthTimeline: false },
  { type: 'custom', emoji: '✨', defaultDailyAmount: 1, defaultUnitCost: 10, hasHealthTimeline: false },
];

export function presetFor(type: QuitType): QuitTypePreset {
  return QUIT_PRESETS.find((p) => p.type === type) ?? QUIT_PRESETS[QUIT_PRESETS.length - 1]!;
}
