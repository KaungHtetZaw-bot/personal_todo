import type { SQLiteDatabase } from "expo-sqlite";

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY NOT NULL,
      list TEXT NOT NULL,
      text TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      position INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      parent_id TEXT,
      title TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS learn_paths (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS learn_categories (
      id TEXT PRIMARY KEY NOT NULL,
      path_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (path_id) REFERENCES learn_paths(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS learn_items (
      id TEXT PRIMARY KEY NOT NULL,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'note',
      url TEXT,
      duration_minutes INTEGER,
      description TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (category_id) REFERENCES learn_categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      author TEXT,
      status TEXT NOT NULL DEFAULT 'saved',
      progress INTEGER NOT NULL DEFAULT 0,
      total_pages INTEGER,
      cover_url TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS workout_routines (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      duration_minutes INTEGER
    );

    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      muscle_group TEXT,
      instructions TEXT,
      video_prompt TEXT
    );

    CREATE TABLE IF NOT EXISTS routine_exercises (
      routine_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      sets INTEGER,
      reps INTEGER,
      duration_seconds INTEGER,
      PRIMARY KEY (routine_id, exercise_id),
      FOREIGN KEY (routine_id) REFERENCES workout_routines(id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS todo_links (
      id TEXT PRIMARY KEY NOT NULL,
      todo_id TEXT NOT NULL UNIQUE,
      resource_type TEXT NOT NULL CHECK (
        resource_type IN ('learn_item', 'book', 'workout_routine', 'exercise')
      ),
      resource_id TEXT NOT NULL,
      FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS resource_packs (
      id TEXT PRIMARY KEY NOT NULL,
      version INTEGER NOT NULL,
      local_path TEXT NOT NULL,
      checksum TEXT,
      installed_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS resource_files (
      id TEXT PRIMARY KEY NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      remote_url TEXT,
      local_path TEXT,
      size INTEGER,
      checksum TEXT
    );

    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_todos_list ON todos(list);
    CREATE INDEX IF NOT EXISTS idx_learn_categories_path ON learn_categories(path_id);
    CREATE INDEX IF NOT EXISTS idx_learn_items_category ON learn_items(category_id);
    CREATE INDEX IF NOT EXISTS idx_todo_links_resource ON todo_links(resource_type, resource_id);
  `);

  const exerciseColumns = await db.getAllAsync<{ name: string }>(
    "PRAGMA table_info(exercises)",
  );
  if (!exerciseColumns.some((column) => column.name === "video_prompt")) {
    await db.execAsync("ALTER TABLE exercises ADD COLUMN video_prompt TEXT");
  }

  const sampleSeed = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM app_meta WHERE key = ?",
    "sample_todos_v1",
  );
  const sampleTodoCount = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM todos WHERE id IN (?, ?, ?)",
    "todo-sample-english-grammar",
    "todo-sample-workout",
    "LinKaDiPa-ChitThu",
  );
  if (!sampleSeed || sampleTodoCount?.count !== 3) {
    const createdAt = Date.now();
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        "INSERT OR IGNORE INTO todos (id, list, text, done, position, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        "PaYateGyi-11-Toat",
        "home",
        "ဘုရားကန်တော့ရန်",
        0,
        0,
        createdAt,
      );
      await db.runAsync(
        "INSERT OR IGNORE INTO todos (id, list, text, done, position, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        "todo-sample-english-grammar",
        "home",
        "Learn English grammar for 10 minutes",
        0,
        1,
        createdAt,
      );
      await db.runAsync(
        "INSERT OR IGNORE INTO todos (id, list, text, done, position, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        "todo-sample-workout",
        "home",
        "Complete Workout Part 1",
        0,
        2,
        createdAt - 1,
      );
      await db.runAsync(
        "INSERT OR IGNORE INTO todos (id, list, text, done, position, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        "LinKaDiPa-ChitThu",
        "home",
        "Read 10 pages",
        0,
        3,
        createdAt - 2,
      );
      await db.runAsync(
        "INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)",
        "sample_todos_v1",
        "seeded",
      );
    });

    // Links are intentionally added after the todo transaction. This keeps
    // first-run migration safe even when an older simulator database contains
    // stale or partially migrated link rows.
    const sampleLinks = [
      [
        "link-todo-sample-english-grammar",
        "todo-sample-english-grammar",
        "learn_item",
        "item-english-grammar",
      ],
      [
        "link-todo-sample-workout",
        "todo-sample-workout",
        "workout_routine",
        "routine-workout-part-1",
      ],
      [
        "link-todo-sample-reading",
        "LinKaDiPa-ChitThu",
        "book",
        "book-linkadipa-chitthu",
      ],
    ] as const;
    for (const [id, todoId, resourceType, resourceId] of sampleLinks) {
      try {
        await db.runAsync(
          "INSERT OR IGNORE INTO todo_links (id, todo_id, resource_type, resource_id) SELECT ?, ?, ?, ? WHERE EXISTS (SELECT 1 FROM todos WHERE id = ?)",
          id,
          todoId,
          resourceType,
          resourceId,
          todoId,
        );
      } catch {
        // A stale link must never prevent the app from opening. The todo
        // remains usable and can be linked again from the UI later.
      }
    }
  }
}
