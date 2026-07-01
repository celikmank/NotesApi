import { getDb } from './index';

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string | null }>(
    `SELECT value FROM settings WHERE key = ?`,
    key
  );
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    key,
    value
  );
}

export async function getBoolSetting(key: string, fallback = false): Promise<boolean> {
  const v = await getSetting(key);
  return v === null ? fallback : v === '1';
}

export async function setBoolSetting(key: string, value: boolean): Promise<void> {
  await setSetting(key, value ? '1' : '0');
}

export const SETTINGS_KEYS = {
  onboardingDone: 'onboarding_done',
  language: 'language',
  dailyMotivation: 'daily_motivation',
  dailyMotivationHour: 'daily_motivation_hour',
  isPremium: 'is_premium', // RevenueCat entitlement cache
} as const;
