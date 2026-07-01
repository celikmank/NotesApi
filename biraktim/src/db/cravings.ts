import { getDb } from './index';
import type { Craving } from './types';

export async function logCraving(
  quitId: number,
  resisted: boolean,
  note?: string
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO cravings (quit_id, timestamp, resisted, note) VALUES (?, ?, ?, ?)`,
    quitId,
    new Date().toISOString(),
    resisted ? 1 : 0,
    note ?? null
  );
}

export async function getCravings(quitId: number): Promise<Craving[]> {
  const db = await getDb();
  return db.getAllAsync<Craving>(
    `SELECT * FROM cravings WHERE quit_id = ? ORDER BY timestamp DESC`,
    quitId
  );
}

/** Son N gün içinde atlatılan kriz sayısı ("bu hafta 3 krizi atlattın"). */
export async function countResistedSince(quitId: number, sinceIso: string): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ c: number }>(
    `SELECT COUNT(*) AS c FROM cravings WHERE quit_id = ? AND resisted = 1 AND timestamp >= ?`,
    quitId,
    sinceIso
  );
  return row?.c ?? 0;
}
