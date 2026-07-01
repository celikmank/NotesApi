import { getDb } from './index';
import type { Streak } from './types';
import { resetMilestones } from './milestones';

/**
 * Relapse akışı: açık seriyi kapatır, quit_date'i şimdiye çeker,
 * yeni seri açar ve milestone'ları sıfırlar. Geçmiş seriler saklanır
 * (churn'ü azaltan kritik detay — "en uzun serin: 34 gün").
 */
export async function relapse(quitId: number): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE streaks SET end_date = ? WHERE quit_id = ? AND end_date IS NULL`,
      now,
      quitId
    );
    await db.runAsync(
      `INSERT INTO streaks (quit_id, start_date, end_date) VALUES (?, ?, NULL)`,
      quitId,
      now
    );
    await db.runAsync(`UPDATE quits SET quit_date = ? WHERE id = ?`, now, quitId);
  });

  await resetMilestones(quitId);
}

export async function getStreaks(quitId: number): Promise<Streak[]> {
  const db = await getDb();
  return db.getAllAsync<Streak>(
    `SELECT * FROM streaks WHERE quit_id = ? ORDER BY start_date DESC`,
    quitId
  );
}

/** En uzun serinin gün cinsinden uzunluğu (devam eden seri dahil). */
export async function getLongestStreakDays(quitId: number): Promise<number> {
  const streaks = await getStreaks(quitId);
  let longest = 0;
  for (const s of streaks) {
    const end = s.end_date ? new Date(s.end_date) : new Date();
    const start = new Date(s.start_date);
    const days = (end.getTime() - start.getTime()) / 86_400_000;
    if (days > longest) longest = days;
  }
  return Math.floor(longest);
}
