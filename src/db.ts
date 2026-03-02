import Database from "@tauri-apps/plugin-sql";

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load("sqlite:habits.db");
    await initTables();
  }
  return db;
}

async function initTables() {
  const d = db!;
  await d.execute(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#6366f1',
      sort_order INTEGER NOT NULL DEFAULT 0,
      archived INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await d.execute(`
    CREATE TABLE IF NOT EXISTS check_ins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      habit_id INTEGER NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (habit_id) REFERENCES habits(id),
      UNIQUE(date, habit_id)
    )
  `);

  // Seed default habits if empty
  const count = await d.select<{ cnt: number }[]>(
    "SELECT COUNT(*) as cnt FROM habits"
  );
  if (count[0].cnt === 0) {
    const defaults = [
      { name: "写作", emoji: "pencil", color: "#6366f1" },
      { name: "运动", emoji: "bolt", color: "#10b981" },
      { name: "阅读", emoji: "book", color: "#f59e0b" },
      { name: "编程", emoji: "code", color: "#3b82f6" },
    ];
    for (let i = 0; i < defaults.length; i++) {
      const h = defaults[i];
      await d.execute(
        "INSERT INTO habits (name, emoji, color, sort_order) VALUES (?, ?, ?, ?)",
        [h.name, h.emoji, h.color, i]
      );
    }
  }
}

export interface Habit {
  id: number;
  name: string;
  emoji: string;
  color: string;
  sort_order: number;
  archived: number;
}

export interface CheckIn {
  id: number;
  date: string;
  habit_id: number;
  completed_at: string;
}

export async function getHabits(): Promise<Habit[]> {
  const d = await getDb();
  return d.select<Habit[]>(
    "SELECT * FROM habits WHERE archived = 0 ORDER BY sort_order"
  );
}

export async function addHabit(
  name: string,
  emoji: string,
  color: string
): Promise<void> {
  const d = await getDb();
  const maxOrder = await d.select<{ m: number | null }[]>(
    "SELECT MAX(sort_order) as m FROM habits"
  );
  const order = (maxOrder[0].m ?? -1) + 1;
  await d.execute(
    "INSERT INTO habits (name, emoji, color, sort_order) VALUES (?, ?, ?, ?)",
    [name, emoji, color, order]
  );
}

export async function updateHabit(
  id: number,
  name: string,
  emoji: string,
  color: string
): Promise<void> {
  const d = await getDb();
  await d.execute(
    "UPDATE habits SET name = ?, emoji = ?, color = ? WHERE id = ?",
    [name, emoji, color, id]
  );
}

export async function deleteHabit(id: number): Promise<void> {
  const d = await getDb();
  await d.execute("UPDATE habits SET archived = 1 WHERE id = ?", [id]);
}

export async function toggleCheckIn(
  date: string,
  habitId: number
): Promise<boolean> {
  const d = await getDb();
  const existing = await d.select<CheckIn[]>(
    "SELECT * FROM check_ins WHERE date = ? AND habit_id = ?",
    [date, habitId]
  );
  if (existing.length > 0) {
    await d.execute(
      "DELETE FROM check_ins WHERE date = ? AND habit_id = ?",
      [date, habitId]
    );
    return false;
  } else {
    await d.execute(
      "INSERT INTO check_ins (date, habit_id) VALUES (?, ?)",
      [date, habitId]
    );
    return true;
  }
}

export async function getCheckInsForYear(
  year: number
): Promise<Map<string, number[]>> {
  const d = await getDb();
  const rows = await d.select<{ date: string; habit_id: number }[]>(
    "SELECT date, habit_id FROM check_ins WHERE date LIKE ? ORDER BY date",
    [`${year}-%`]
  );
  const map = new Map<string, number[]>();
  for (const row of rows) {
    const arr = map.get(row.date) || [];
    arr.push(row.habit_id);
    map.set(row.date, arr);
  }
  return map;
}

export async function getStreak(habitId: number): Promise<number> {
  const d = await getDb();
  const today = new Date();
  let streak = 0;
  let current = new Date(today);

  while (true) {
    const dateStr = formatDate(current);
    const rows = await d.select<{ cnt: number }[]>(
      "SELECT COUNT(*) as cnt FROM check_ins WHERE date = ? AND habit_id = ?",
      [dateStr, habitId]
    );
    if (rows[0].cnt === 0) break;
    streak++;
    current.setDate(current.getDate() - 1);
  }
  return streak;
}

export async function getCheckInsForDate(
  date: string
): Promise<number[]> {
  const d = await getDb();
  const rows = await d.select<{ habit_id: number }[]>(
    "SELECT habit_id FROM check_ins WHERE date = ?",
    [date]
  );
  return rows.map((r) => r.habit_id);
}

export async function getWeeklyStats(
  habits: Habit[]
): Promise<{ completed: number; total: number }> {
  const d = await getDb();
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  const startDate = formatDate(monday);
  const endDate = formatDate(today);

  const rows = await d.select<{ cnt: number }[]>(
    "SELECT COUNT(*) as cnt FROM check_ins WHERE date >= ? AND date <= ? AND habit_id IN (" +
      habits.map(() => "?").join(",") +
    ")",
    [startDate, endDate, ...habits.map((h) => h.id)]
  );

  const daysPassed = Math.floor(
    (today.getTime() - monday.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;
  const total = daysPassed * habits.length;

  return { completed: rows[0].cnt, total };
}

export async function getTotalCheckIns(
  habits: Habit[]
): Promise<number> {
  if (habits.length === 0) return 0;
  const d = await getDb();
  const rows = await d.select<{ cnt: number }[]>(
    "SELECT COUNT(*) as cnt FROM check_ins WHERE habit_id IN (" +
      habits.map(() => "?").join(",") +
    ")",
    [...habits.map((h) => h.id)]
  );
  return rows[0].cnt;
}

export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
