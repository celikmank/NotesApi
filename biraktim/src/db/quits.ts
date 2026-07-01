import { getDb } from './index';
import type { NewQuit, Quit } from './types';
import { seedMilestonesForQuit } from './milestones';

/** Yeni bırakma oluşturur, ilk seriyi ve milestone'ları tohumlar. */
export async function createQuit(input: NewQuit): Promise<Quit> {
  const db = await getDb();
  const createdAt = new Date().toISOString();

  const result = await db.runAsync(
    `INSERT INTO quits (type, name, quit_date, daily_amount, unit_cost, currency, created_at, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
    input.type,
    input.name,
    input.quit_date,
    input.daily_amount,
    input.unit_cost,
    input.currency,
    createdAt
  );

  const id = result.lastInsertRowId;

  // İlk seri: bırakma tarihinde başlar, açık uçlu.
  await db.runAsync(
    `INSERT INTO streaks (quit_id, start_date, end_date) VALUES (?, ?, NULL)`,
    id,
    input.quit_date
  );

  await seedMilestonesForQuit(id);

  return getQuitById(id) as Promise<Quit>;
}

export async function getActiveQuit(): Promise<Quit | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Quit>(
    `SELECT * FROM quits WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1`
  );
  return row ?? null;
}

export async function getAllQuits(): Promise<Quit[]> {
  const db = await getDb();
  return db.getAllAsync<Quit>(`SELECT * FROM quits ORDER BY created_at DESC`);
}

export async function getQuitById(id: number): Promise<Quit | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Quit>(`SELECT * FROM quits WHERE id = ?`, id);
  return row ?? null;
}

export async function countActiveQuits(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ c: number }>(
    `SELECT COUNT(*) AS c FROM quits WHERE is_active = 1`
  );
  return row?.c ?? 0;
}

export async function deactivateQuit(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(`UPDATE quits SET is_active = 0 WHERE id = ?`, id);
}
