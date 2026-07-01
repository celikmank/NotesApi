import { getDb } from './index';
import type { Milestone } from './types';
import { TIME_MILESTONES_SECONDS, MONEY_MILESTONES } from '../logic/milestones';

/** Bir bırakma için tüm süre + para milestone'larını (achieved_at = NULL) oluşturur. */
export async function seedMilestonesForQuit(quitId: number): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const seconds of TIME_MILESTONES_SECONDS) {
      await db.runAsync(
        `INSERT INTO milestones (quit_id, kind, threshold, achieved_at) VALUES (?, 'time', ?, NULL)`,
        quitId,
        seconds
      );
    }
    for (const amount of MONEY_MILESTONES) {
      await db.runAsync(
        `INSERT INTO milestones (quit_id, kind, threshold, achieved_at) VALUES (?, 'money', ?, NULL)`,
        quitId,
        amount
      );
    }
  });
}

export async function getMilestones(quitId: number): Promise<Milestone[]> {
  const db = await getDb();
  return db.getAllAsync<Milestone>(
    `SELECT * FROM milestones WHERE quit_id = ? ORDER BY kind, threshold`,
    quitId
  );
}

/**
 * Ulaşılmış ama işaretlenmemiş milestone'ları işaretler; yeni ulaşılanları döndürür
 * (kutlama tetiklemek için).
 */
export async function markAchievedMilestones(
  quitId: number,
  elapsedSeconds: number,
  moneySaved: number
): Promise<Milestone[]> {
  const db = await getDb();
  const now = new Date().toISOString();
  const pending = await db.getAllAsync<Milestone>(
    `SELECT * FROM milestones WHERE quit_id = ? AND achieved_at IS NULL`,
    quitId
  );

  const newlyAchieved: Milestone[] = [];
  for (const m of pending) {
    const value = m.kind === 'time' ? elapsedSeconds : moneySaved;
    if (value >= m.threshold) {
      await db.runAsync(`UPDATE milestones SET achieved_at = ? WHERE id = ?`, now, m.id);
      newlyAchieved.push({ ...m, achieved_at: now });
    }
  }
  return newlyAchieved;
}

/** Milestone'ları relapse sonrası sıfırlar (achieved_at = NULL). */
export async function resetMilestones(quitId: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE milestones SET achieved_at = NULL WHERE quit_id = ?`,
    quitId
  );
}
