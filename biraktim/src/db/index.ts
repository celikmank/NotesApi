import * as SQLite from 'expo-sqlite';
import { CREATE_STATEMENTS, SCHEMA_VERSION } from './schema';

let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Migrations: index === hedef sürüm. v1 create statements'ı çalıştırır.
 * İleride v2, v3... eklendikçe diziye ALTER/CREATE eklenir.
 */
const MIGRATIONS: Array<(db: SQLite.SQLiteDatabase) => Promise<void>> = [
  async (db) => {
    await db.execAsync(CREATE_STATEMENTS);
  },
];

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  const db = await SQLite.openDatabaseAsync('biraktim.db');
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await runMigrations(db);
  dbInstance = db;
  return db;
}

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  const current = row?.user_version ?? 0;

  for (let v = current; v < SCHEMA_VERSION; v++) {
    const migration = MIGRATIONS[v];
    if (migration) await migration(db);
  }

  if (current < SCHEMA_VERSION) {
    // user_version parametre kabul etmez; literal olarak yazılır.
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
  }
}

/** Test / hesap silme için: tüm verileri temizler. */
export async function resetDatabase(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    DELETE FROM cravings;
    DELETE FROM streaks;
    DELETE FROM milestones;
    DELETE FROM quits;
    DELETE FROM settings;
  `);
}
