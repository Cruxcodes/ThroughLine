import * as SQLite from "expo-sqlite";
import type { Entry, University } from "../lib/types";

const db = SQLite.openDatabaseSync("throughline.db");
db.execSync(`CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY, date TEXT NOT NULL, promptShown TEXT, text TEXT NOT NULL,
  riskLevel TEXT, themes TEXT, domain TEXT, stressor TEXT, createdAt INTEGER );`);

// Migration: add the model-generated `stressor` column to DBs created before it
// existed. SQLite throws on a duplicate column, so swallow that case.
try {
  db.execSync(`ALTER TABLE entries ADD COLUMN stressor TEXT`);
} catch {
  // column already present — nothing to do
}

// Simple key/value table for app preferences (e.g. whether onboarding is done).
db.execSync(`CREATE TABLE IF NOT EXISTS prefs ( key TEXT PRIMARY KEY, value TEXT );`);

// The user's chosen university and its mental-health service contact, picked
// once after onboarding. Single-row table (id is always pinned to 1) so a
// re-selection overwrites the previous choice. Drives the Support page card.
db.execSync(`CREATE TABLE IF NOT EXISTS university (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  key TEXT NOT NULL, name TEXT NOT NULL, city TEXT, serviceName TEXT,
  phone TEXT, email TEXT, url TEXT NOT NULL, notes TEXT );`);

const ONBOARDING_KEY = "onboarding_complete";
const REMINDER_SHOWN_KEY = "last_reminder_shown";
const MH_SUGGESTION_SHOWN_KEY = "mh_suggestion_shown";

export function hasCompletedOnboarding(): boolean {
  const row = db.getFirstSync<{ value: string }>(
    `SELECT value FROM prefs WHERE key = ?`,
    [ONBOARDING_KEY]
  );
  return row?.value === "1";
}

export function markOnboardingComplete() {
  db.runSync(
    `INSERT OR REPLACE INTO prefs (key, value) VALUES (?, ?)`,
    [ONBOARDING_KEY, "1"]
  );
}

// Check whether to show an in-app reminder: true if it's been >24 hours since
// the last journal entry AND >24 hours since we last showed a reminder.
// This is a "local" approximation of a daily reminder that doesn't require
// system notifications or a rebuild.
export function shouldShowReminder(): boolean {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const entries = getEntries();
  const lastEntry = entries.length > 0 ? entries[entries.length - 1] : null;
  const lastEntryMs = lastEntry?.createdAt ?? 0;
  const reminderRow = db.getFirstSync<{ value: string }>(
    `SELECT value FROM prefs WHERE key = ?`,
    [REMINDER_SHOWN_KEY]
  );
  const lastReminderMs = reminderRow?.value ? Number(reminderRow.value) : 0;
  return now - lastEntryMs > dayMs && now - lastReminderMs > dayMs;
}

// Mark that we just showed a reminder (so we don't nag again for at least
// 24 hours). Call after rendering the banner.
export function markReminderShown() {
  db.runSync(
    `INSERT OR REPLACE INTO prefs (key, value) VALUES (?, ?)`,
    [REMINDER_SHOWN_KEY, String(Date.now())]
  );
}

// Reset reminder state (for testing/debugging — call from dev menu).
export function clearReminderState() {
  db.runSync(`DELETE FROM prefs WHERE key = ?`, [REMINDER_SHOWN_KEY]);
}

// Track whether we've shown the mental health support suggestion.
export function shouldShowMHSuggestion(): boolean {
  const row = db.getFirstSync<{ value: string }>(
    `SELECT value FROM prefs WHERE key = ?`,
    [MH_SUGGESTION_SHOWN_KEY]
  );
  return !row; // true if never shown before
}

export function markMHSuggestionShown() {
  db.runSync(
    `INSERT OR REPLACE INTO prefs (key, value) VALUES (?, ?)`,
    [MH_SUGGESTION_SHOWN_KEY, "1"]
  );
}

export function addEntry(e: Entry) {
  db.runSync(
    `INSERT OR REPLACE INTO entries
       (id, date, promptShown, text, riskLevel, themes, domain, stressor, createdAt)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [
      e.id,
      e.date,
      e.promptShown ?? null,
      e.text,
      e.riskLevel ?? "none",
      JSON.stringify(e.themes ?? []),
      e.domain ?? "general",
      e.stressor ?? null,
      e.createdAt,
    ]
  );
}

export function getEntries(): Entry[] {
  return db
    .getAllSync<any>(`SELECT * FROM entries ORDER BY date ASC`)
    .map((r) => ({
      ...r,
      themes: JSON.parse(r.themes || "[]"),
      stressor: r.stressor ?? undefined,
    }));
}

export function hasSelectedUniversity(): boolean {
  const row = db.getFirstSync<{ n: number }>(`SELECT COUNT(*) AS n FROM university`);
  return !!row && row.n > 0;
}

// Persist the chosen university (overwriting any prior pick). null DB columns
// become `undefined` on the type, matching the optional phone/email contract.
export function saveUniversity(u: University) {
  db.runSync(
    `INSERT OR REPLACE INTO university
       (id, key, name, city, serviceName, phone, email, url, notes)
     VALUES (1,?,?,?,?,?,?,?,?)`,
    [u.key, u.name, u.city, u.serviceName, u.phone ?? null, u.email ?? null, u.url, u.notes]
  );
}

export function getUniversity(): University | null {
  const r = db.getFirstSync<any>(`SELECT * FROM university WHERE id = 1`);
  if (!r) return null;
  return {
    key: r.key,
    name: r.name,
    city: r.city ?? "",
    serviceName: r.serviceName ?? "",
    phone: r.phone ?? undefined,
    email: r.email ?? undefined,
    url: r.url,
    notes: r.notes ?? "",
  };
}
