/**
 * SQLite şeması. Local-first, hesap yok, sunucu yok.
 * Sürüm arttıkça migrations dizisine ekleme yapılır (index.ts).
 */
export const SCHEMA_VERSION = 1;

export const CREATE_STATEMENTS = `
CREATE TABLE IF NOT EXISTS quits (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  type          TEXT    NOT NULL,           -- 'smoking' | 'alcohol' | ... | 'custom'
  name          TEXT    NOT NULL,
  quit_date     TEXT    NOT NULL,           -- ISO 8601
  daily_amount  REAL    NOT NULL DEFAULT 0, -- günlük tüketilen adet (ör. sigara/gün)
  unit_cost     REAL    NOT NULL DEFAULT 0, -- birim başına maliyet (ör. sigara başı fiyat)
  currency      TEXT    NOT NULL DEFAULT 'TRY',
  created_at    TEXT    NOT NULL,
  is_active     INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS milestones (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  quit_id      INTEGER NOT NULL,
  kind         TEXT    NOT NULL,            -- 'time' | 'money'
  threshold    REAL    NOT NULL,            -- time: saniye, money: para tutarı
  achieved_at  TEXT,                        -- NULL ise henüz ulaşılmadı
  FOREIGN KEY (quit_id) REFERENCES quits(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cravings (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  quit_id    INTEGER NOT NULL,
  timestamp  TEXT    NOT NULL,
  resisted   INTEGER NOT NULL DEFAULT 1,
  note       TEXT,
  FOREIGN KEY (quit_id) REFERENCES quits(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS streaks (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  quit_id    INTEGER NOT NULL,
  start_date TEXT    NOT NULL,
  end_date   TEXT,                          -- NULL ise devam eden seri
  FOREIGN KEY (quit_id) REFERENCES quits(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);

CREATE INDEX IF NOT EXISTS idx_milestones_quit ON milestones(quit_id);
CREATE INDEX IF NOT EXISTS idx_cravings_quit   ON cravings(quit_id);
CREATE INDEX IF NOT EXISTS idx_streaks_quit    ON streaks(quit_id);
`;
