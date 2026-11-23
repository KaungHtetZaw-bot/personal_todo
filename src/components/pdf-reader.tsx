import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { SafeAreaView } from "react-native-safe-area-context";
import PdfViewer from "./pdf-viewer";

type BookPdf = {
  title: string;
  author: string | null;
  local_path: string | null;
};

export default function PdfReader() {
  const db = useSQLiteContext();
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const [book, setBook] = useState<BookPdf | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookId) return;
    db.getFirstAsync<BookPdf>(
      `SELECT books.title, books.author, resource_files.local_path
       FROM books
       INNER JOIN resource_files
         ON resource_files.resource_type = 'book'
        AND resource_files.resource_id = books.id
       WHERE books.id = ? AND resource_files.mime_type = 'application/pdf'`,
      bookId,
    )
      .then(setBook)
      .finally(() => setLoading(false));
  }, [bookId, db]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button">
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View style={styles.titleWrap}>
            <Text style={styles.title} numberOfLines={1}>{book?.title ?? "PDF reader"}</Text>
            {book?.author ? <Text style={styles.author} numberOfLines={1}>{book.author}</Text> : null}
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#ffffff" />
            <Text style={styles.message}>Preparing PDF…</Text>
          </View>
        ) : book?.local_path ? (
          <PdfViewer uri={book.local_path} onError={() => setBook(null)} />
        ) : (
          <View style={styles.center}>
            <Text style={styles.message}>This PDF is not downloaded yet.</Text>
            <Text style={styles.hint}>Open the app online once to download resources.</Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#151515" },
  safeArea: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  backText: { color: "#ffffff", fontSize: 36, lineHeight: 38, fontWeight: "300" },
  titleWrap: { flex: 1 },
  title: { color: "#ffffff", fontSize: 16, lineHeight: 22, fontWeight: "700" },
  author: { color: "#bdbdbd", fontSize: 12, lineHeight: 17 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 24 },
  message: { color: "#ffffff", fontSize: 15, textAlign: "center" },
  hint: { color: "#bdbdbd", fontSize: 13, textAlign: "center" },
});
