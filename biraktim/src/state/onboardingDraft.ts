import { useSyncExternalStore } from 'react';
import type { QuitType } from '../db/types';
import { presetFor } from '../logic/quitTypes';

export interface OnboardingDraft {
  type: QuitType;
  name: string;
  dailyAmount: number;
  unitCost: number;
  currency: string;
  quitDate: string; // ISO
}

function initialDraft(): OnboardingDraft {
  const preset = presetFor('smoking');
  return {
    type: 'smoking',
    name: '',
    dailyAmount: preset.defaultDailyAmount,
    unitCost: preset.defaultUnitCost,
    currency: 'TRY',
    quitDate: new Date().toISOString(),
  };
}

let draft: OnboardingDraft = initialDraft();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function updateDraft(patch: Partial<OnboardingDraft>): void {
  draft = { ...draft, ...patch };
  emit();
}

export function selectType(type: QuitType): void {
  const preset = presetFor(type);
  draft = {
    ...draft,
    type,
    dailyAmount: preset.defaultDailyAmount,
    unitCost: preset.defaultUnitCost,
  };
  emit();
}

export function resetDraft(): void {
  draft = initialDraft();
  emit();
}

/** React bileşenlerinde taslağı okumak için. */
export function useOnboardingDraft(): OnboardingDraft {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => draft,
    () => draft
  );
}

export function getDraft(): OnboardingDraft {
  return draft;
}
