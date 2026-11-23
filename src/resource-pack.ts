import * as FileSystem from "expo-file-system/legacy";
import type { SQLiteDatabase } from "expo-sqlite";

/** Set this after publishing a manifest.json to your static resource host. */
export const RESOURCE_MANIFEST_URL =
  "https://raw.githubusercontent.com/KaungHtetZaw-bot/personal_todo/main/resources/v1/manifest.json";

type ResourceManifest = {
  version: number;
  checksum?: string;
  files: {
    learnPaths: string;
    learnCategories: string;
    learnItems: string;
    books: string;
    workoutRoutines: string;
    exercises: string;
    routineExercises: string;
  };
};

type ResourcePack = {
  manifest: ResourceManifest;
  learnPaths: { id: string; name: string; description?: string }[];
  learnCategories: { id: string; path_id: string; name: string; description?: string; position?: number }[];
  learnItems: {
    id: string;
    category_id: string;
    name: string;
    type?: string;
    url?: string;
    duration_minutes?: number;
    description?: string;
    position?: number;
  }[];
  books: {
    id: string;
    title: string;
    author?: string;
    status?: string;
    progress?: number;
    total_pages?: number;
    cover_url?: string;
    cover_file_name?: string;
    cover_mime_type?: string;
    notes?: string;
    file_name?: string;
    mime_type?: string;
    file_url?: string;
  }[];
  workoutRoutines: { id: string; name: string; description?: string; duration_minutes?: number }[];
  exercises: { id: string; name: string; muscle_group?: string; instructions?: string; video_prompt?: string }[];
  routineExercises: {
    routine_id: string;
    exercise_id: string;
    position?: number;
    sets?: number;
    reps?: number;
    duration_seconds?: number;
  }[];
};

export async function syncResourcePack(db: SQLiteDatabase): Promise<number | null> {
  if (!RESOURCE_MANIFEST_URL || !FileSystem.documentDirectory) return null;

  const manifest = await downloadJson<ResourceManifest>(RESOURCE_MANIFEST_URL, "manifest.json");
  const books = await downloadJson<ResourcePack["books"]>(manifest.files.books, "books.json");
  const installed = await db.getFirstAsync<{ version: number }>(
    "SELECT version FROM resource_packs ORDER BY version DESC LIMIT 1",
  );
  if (installed && installed.version >= manifest.version && await hasAllBookFiles(db, books)) {
    return installed.version;
  }

  const packDirectory = `${FileSystem.documentDirectory}resources/v${manifest.version}/`;
  await FileSystem.makeDirectoryAsync(packDirectory, { intermediates: true });

  const pack: ResourcePack = {
    manifest,
    learnPaths: await downloadJson(manifest.files.learnPaths, "learn-paths.json", packDirectory),
    learnCategories: await downloadJson(manifest.files.learnCategories, "learn-categories.json", packDirectory),
    learnItems: await downloadJson(manifest.files.learnItems, "learn-items.json", packDirectory),
    books,
    workoutRoutines: await downloadJson(manifest.files.workoutRoutines, "workout-routines.json", packDirectory),
    exercises: await downloadJson(manifest.files.exercises, "exercises.json", packDirectory),
    routineExercises: await downloadJson(manifest.files.routineExercises, "routine-exercises.json", packDirectory),
  };

  const downloadedFiles: {
    id: string;
    resourceType: string;
    resourceId: string;
    fileName: string;
    mimeType: string;
    remoteUrl: string;
    localPath: string;
    size: number | null;
  }[] = [];

  for (const book of pack.books) {
    if (book.file_url && book.file_name) {
      downloadedFiles.push(await downloadResourceFile({
        id: `file-${book.id}`,
        resourceType: "book",
        resourceId: book.id,
        fileName: book.file_name,
        mimeType: book.mime_type ?? "application/octet-stream",
        remoteUrl: book.file_url,
        packDirectory,
      }));
    }
    if (book.cover_url) {
      downloadedFiles.push(await downloadResourceFile({
        id: `cover-${book.id}`,
        resourceType: "book_cover",
        resourceId: book.id,
        fileName: book.cover_file_name ?? `books/covers/${book.id}.jpg`,
        mimeType: book.cover_mime_type ?? "image/jpeg",
        remoteUrl: book.cover_url,
        packDirectory,
      }));
    }
  }

  await db.withTransactionAsync(async () => {
    for (const row of pack.learnPaths) {
      await db.runAsync("INSERT OR REPLACE INTO learn_paths (id, name, description) VALUES (?, ?, ?)", row.id, row.name, row.description ?? null);
    }
    for (const row of pack.learnCategories) {
      await db.runAsync("INSERT OR REPLACE INTO learn_categories (id, path_id, name, description, position) VALUES (?, ?, ?, ?, ?)", row.id, row.path_id, row.name, row.description ?? null, row.position ?? 0);
    }
    for (const row of pack.learnItems) {
      await db.runAsync("INSERT OR REPLACE INTO learn_items (id, category_id, name, type, url, duration_minutes, description, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", row.id, row.category_id, row.name, row.type ?? "note", row.url ?? null, row.duration_minutes ?? null, row.description ?? null, row.position ?? 0);
    }
    for (const row of pack.books) {
      await db.runAsync("INSERT OR REPLACE INTO books (id, title, author, status, progress, total_pages, cover_url, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", row.id, row.title, row.author ?? null, row.status ?? "saved", row.progress ?? 0, row.total_pages ?? null, row.cover_url ?? null, row.notes ?? null);
    }
    for (const row of pack.workoutRoutines) {
      await db.runAsync("INSERT OR REPLACE INTO workout_routines (id, name, description, duration_minutes) VALUES (?, ?, ?, ?)", row.id, row.name, row.description ?? null, row.duration_minutes ?? null);
    }
    for (const row of pack.exercises) {
      await db.runAsync("INSERT OR REPLACE INTO exercises (id, name, muscle_group, instructions, video_prompt) VALUES (?, ?, ?, ?, ?)", row.id, row.name, row.muscle_group ?? null, row.instructions ?? null, row.video_prompt ?? null);
    }
    for (const row of pack.routineExercises) {
      await db.runAsync("INSERT OR REPLACE INTO routine_exercises (routine_id, exercise_id, position, sets, reps, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)", row.routine_id, row.exercise_id, row.position ?? 0, row.sets ?? null, row.reps ?? null, row.duration_seconds ?? null);
    }
    for (const file of downloadedFiles) {
      await db.runAsync(
        "INSERT OR REPLACE INTO resource_files (id, resource_type, resource_id, file_name, mime_type, remote_url, local_path, size) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        file.id,
        file.resourceType,
        file.resourceId,
        file.fileName,
        file.mimeType,
        file.remoteUrl,
        file.localPath,
        file.size,
      );
    }
    await db.runAsync("INSERT OR REPLACE INTO resource_packs (id, version, local_path, checksum, installed_at) VALUES (?, ?, ?, ?, ?)", `resources-v${manifest.version}`, manifest.version, packDirectory, manifest.checksum ?? null, Date.now());
  });

  return manifest.version;
}

async function downloadJson<T>(url: string, fileName: string, directory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? "") {
  if (!url) throw new Error(`Resource URL is missing for ${fileName}`);
  const destination = `${directory}${fileName}`;
  await FileSystem.downloadAsync(url, destination);
  const content = await FileSystem.readAsStringAsync(destination);
  return JSON.parse(content) as T;
}

async function hasAllBookFiles(db: SQLiteDatabase, books: ResourcePack["books"]) {
  const expected = books.flatMap((book) => [
    book.file_url ? `file-${book.id}` : null,
    book.cover_url ? `cover-${book.id}` : null,
  ].filter((id): id is string => Boolean(id)));
  if (expected.length === 0) return true;

  const rows = await db.getAllAsync<{ id: string; local_path: string | null }>(
    "SELECT id, local_path FROM resource_files WHERE id IN (" + expected.map(() => "?").join(",") + ")",
    ...expected,
  );
  if (rows.length !== expected.length || rows.some((row) => !row.local_path)) return false;

  const states = await Promise.all(rows.map((row) => FileSystem.getInfoAsync(row.local_path as string)));
  return states.every((state) => state.exists);
}

async function downloadResourceFile(input: {
  id: string;
  resourceType: string;
  resourceId: string;
  fileName: string;
  mimeType: string;
  remoteUrl: string;
  packDirectory: string;
}) {
  const localPath = `${input.packDirectory}${input.fileName}`;
  const directory = localPath.slice(0, localPath.lastIndexOf("/") + 1);
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  const result = await FileSystem.downloadAsync(input.remoteUrl, localPath);
  const info = await FileSystem.getInfoAsync(result.uri);
  return {
    id: input.id,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    fileName: input.fileName,
    mimeType: input.mimeType,
    remoteUrl: input.remoteUrl,
    localPath: result.uri,
    size: info.exists && "size" in info ? info.size ?? null : null,
  };
}
