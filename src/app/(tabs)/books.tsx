import { useSQLiteContext } from "expo-sqlite";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  MaxContentWidth,
  Spacing,
  boxShadow,
  typeStyle,
  useDesign,
  useTheme,
} from "@/theme";
import { subscribeResourcePack } from "@/resource-pack";

type BookStatus = "reading" | "saved" | "finished";
type Book = {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  progress: number;
  detail: string;
  color: string;
  coverUri?: string;
  filePath?: string;
};

type BookRow = {
  id: string;
  title: string;
  author: string | null;
  status: BookStatus;
  progress: number;
  total_pages: number | null;
  notes: string | null;
  file_name: string | null;
  local_path: string | null;
  size: number | null;
  cover_local_path: string | null;
};

const FILTERS: { id: "all" | BookStatus; label: string }[] = [
  { id: "all", label: "All books" },
  { id: "reading", label: "Reading" },
  { id: "saved", label: "Saved" },
  { id: "finished", label: "Finished" },
];

const containsMyanmar = (value: string) => /[\u1000-\u109f]/.test(value);

export default function BooksScreen() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const { tokens } = useDesign();
  const [books, setBooks] = useState<Book[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  useEffect(() => {
    let mounted = true;
    const loadBooks = async () => {
      try {
        const rows = await db.getAllAsync<BookRow>(
          `SELECT books.id, books.title, books.author, books.status, books.progress,
            books.total_pages, books.notes, resource_files.file_name, resource_files.local_path, resource_files.size,
            cover_files.local_path as cover_local_path
           FROM books
           LEFT JOIN resource_files
             ON resource_files.resource_type = 'book'
            AND resource_files.resource_id = books.id
           LEFT JOIN resource_files as cover_files
             ON cover_files.resource_type = 'book_cover'
            AND cover_files.resource_id = books.id
           ORDER BY CASE books.status WHEN 'reading' THEN 0 WHEN 'saved' THEN 1 ELSE 2 END, books.title`,
        );
        if (mounted) setBooks(rows.map(toBook));
      } catch {
        if (mounted) setBooks([]);
      }
    };
    loadBooks();
    const unsubscribe = subscribeResourcePack(loadBooks);

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [db]);

  const current = books.find((book) => book.status === "reading") ?? books[0];
  const visibleBooks =
    filter === "all" ? books : books.filter((book) => book.status === filter);
  const item = tokens.item;
  const isCard = item.style === "card";

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[typeStyle(tokens.title), { color: theme.text }]}>
              Books
            </Text>
            <Text
              style={[
                typeStyle(tokens.subtitle),
                { color: theme.textSecondary },
              ]}
            >
              A quiet place for your reading list.
            </Text>
          </View>

          {current ? (
            <View
              style={[
                styles.currentCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  borderRadius: Math.max(item.radius, 16),
                  borderWidth: isCard ? item.borderWidth : 1,
                  boxShadow: boxShadow(item.shadow, theme.shadow),
                },
              ]}
            >
              <Text style={[styles.eyebrow, { color: theme.textMuted }]}>
                CURRENTLY READING
              </Text>
              <View style={styles.currentContent}>
                <BookCover book={current} />
                <View style={styles.currentInfo}>
                  <Text style={[styles.currentTitle, { color: theme.text }]}>
                    {current.title}
                  </Text>
                  <Text style={[styles.author, { color: theme.textSecondary }]}>
                    {current.author}
                  </Text>
                  <Text style={[styles.progressDetail, { color: theme.text }]}>
                    {current.progress}% complete
                  </Text>
                  <View
                    style={[
                      styles.progressTrack,
                      { backgroundColor: theme.border },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: theme.accent,
                          width: `${current.progress}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.progressNote,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {current.detail}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={[styles.emptyState, { borderColor: theme.border }]}>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No books yet
              </Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Your downloaded book resources will appear here.
              </Text>
            </View>
          )}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            {FILTERS.map((option) => {
              const selected = filter === option.id;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole='radio'
                  accessibilityState={{ selected }}
                  accessibilityLabel={option.label}
                  onPress={() => setFilter(option.id)}
                  style={({ pressed }) => [
                    styles.filter,
                    {
                      backgroundColor: selected ? theme.tagBg : "transparent",
                      borderColor: selected ? theme.accent : theme.border,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      { color: selected ? theme.accent : theme.textSecondary },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.libraryHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              YOUR LIBRARY
            </Text>
            <Text style={[styles.bookCount, { color: theme.textMuted }]}>
              {visibleBooks.length} books
            </Text>
          </View>

          <View style={styles.bookList}>
            {visibleBooks.map((book) => (
              <Pressable
                key={book.id}
                accessibilityRole='button'
                accessibilityLabel={`${book.title} by ${book.author}`}
                disabled={!book.filePath}
                onPress={() => book.filePath && router.push({ pathname: "/pdf/[bookId]", params: { bookId: book.id } })}
                style={({ pressed }) => [
                  styles.bookRow,
                  isCard
                    ? {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                        borderRadius: item.radius,
                        borderWidth: item.borderWidth,
                        boxShadow: boxShadow(item.shadow, theme.shadow),
                      }
                    : { borderBottomColor: theme.border, borderBottomWidth: 1 },
                  pressed && styles.pressed,
                ]}
              >
                <BookCover book={book} small />
                <View style={styles.bookInfo}>
                  <Text
                    style={[
                      typeStyle(item.text),
                      { color: theme.text },
                      containsMyanmar(book.title) && styles.myanmarText,
                    ]}
                    numberOfLines={3}
                  >
                    {book.title}
                  </Text>
                  <Text
                    style={[
                      styles.author,
                      { color: theme.textSecondary },
                      containsMyanmar(book.author) && styles.myanmarText,
                    ]}
                  >
                    {book.author}
                  </Text>
                  <Text style={[styles.bookDetail, { color: theme.textMuted }]}>
                    {book.detail}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.status,
                    {
                      color:
                        book.status === "finished"
                          ? theme.accent
                          : theme.textSecondary,
                    },
                  ]}
                >
                  {book.status === "reading"
                    ? `${book.progress}%`
                    : book.status}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function BookCover({ book, small = false }: { book: Book; small?: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.cover,
        small && styles.coverSmall,
        { backgroundColor: book.color, borderColor: theme.border },
      ]}
    >
      {book.coverUri ? (
        <Image
          source={{ uri: book.coverUri }}
          style={[styles.coverImage, small && styles.coverImageSmall]}
          resizeMode='cover'
        />
      ) : (
        <Text
          style={[
            styles.coverInitials,
            small && styles.coverInitialsSmall,
            containsMyanmar(book.title) && styles.myanmarCoverText,
            { color: "#17130d" },
          ]}
        >
          {book.title
            .split(" ")
            .slice(0, 2)
            .map((word) => word[0])
            .join("")}
        </Text>
      )}
    </View>
  );
}

function toBook(row: BookRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author ?? "Unknown author",
    status: row.status,
    progress: row.progress ?? 0,
    detail: row.file_name
      ? `${row.file_name.toLowerCase().endsWith(".pdf") ? "PDF" : "File"} · ${formatSize(row.size)}`
      : (row.notes ??
        (row.total_pages ? `${row.total_pages} pages` : "Saved book")),
    color: colorForBook(row.id),
    coverUri: row.cover_local_path ?? undefined,
    filePath: row.file_name?.toLowerCase().endsWith(".pdf") ? row.local_path ?? undefined : undefined,
  };
}

function formatSize(size: number | null) {
  if (!size) return "downloaded";
  return size >= 1024 * 1024
    ? `${(size / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.round(size / 1024)} KB`;
}

function colorForBook(id: string) {
  const colors = ["#f1b84b", "#6a8fd7", "#d98f9e", "#73aa7d", "#c7a36a"];
  const seed = id
    .split("")
    .reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return colors[seed % colors.length];
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", justifyContent: "center" },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
  },
  scroll: { flex: 1 },
  content: { paddingBottom: Spacing.six },
  header: { gap: Spacing.one, paddingBottom: Spacing.four },
  currentCard: {
    padding: Spacing.three,
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  eyebrow: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  currentContent: { flexDirection: "row", gap: Spacing.three },
  currentInfo: { flex: 1, justifyContent: "center", gap: 2 },
  currentTitle: { fontSize: 21, lineHeight: 42, fontWeight: "800" },
  author: { fontSize: 12, lineHeight: 24 },
  progressDetail: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    marginTop: Spacing.two,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: Spacing.one,
  },
  progressFill: { height: "100%", borderRadius: 3 },
  progressNote: { fontSize: 11, lineHeight: 15, marginTop: 3 },
  cover: {
    width: 74,
    height: 98,
    borderWidth: 1,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  coverImage: { width: "100%", height: "100%", borderRadius: 4 },
  coverImageSmall: { borderRadius: 3 },
  coverSmall: { width: 46, height: 62, borderRadius: 4 },
  coverInitials: { fontSize: 22, lineHeight: 27, fontWeight: "900" },
  coverInitialsSmall: { fontSize: 14, lineHeight: 18 },
  filters: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
    paddingBottom: Spacing.four,
  },
  filter: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  filterText: { fontSize: 12, lineHeight: 16, fontWeight: "700" },
  libraryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    letterSpacing: 1,
  },
  bookCount: { fontSize: 12, lineHeight: 16 },
  bookList: { gap: Spacing.two, marginTop: Spacing.two },
  bookRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.two,
    gap: Spacing.three,
  },
  bookInfo: { flex: 1, gap: 2 },
  bookDetail: { fontSize: 11, lineHeight: 15, marginTop: Spacing.one },
  status: { fontSize: 11, lineHeight: 15, fontWeight: "800" },
  pressed: { opacity: 0.7 },
  emptyState: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.one,
    marginBottom: Spacing.three,
  },
  emptyTitle: { fontSize: 16, lineHeight: 22, fontWeight: "800" },
  emptyText: { fontSize: 13, lineHeight: 19 },
  myanmarText: {
    fontFamily: Platform.OS === "ios" ? "Myanmar Text" : "sans-serif",
    lineHeight: 36,
  },
  myanmarCoverText: {
    fontFamily: Platform.OS === "ios" ? "Myanmar Text" : "sans-serif",
    fontSize: 16,
    lineHeight: 23,
    textAlign: "center",
  },
});
