import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PdfReaderWebFallback() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button">
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <View style={styles.center}>
          <Text style={styles.title}>PDF reader</Text>
          <Text style={styles.message}>In-app PDF reading is available in the Android/iOS build.</Text>
          <Text style={styles.hint}>Web fallback for book: {bookId}</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#151515" },
  safeArea: { flex: 1 },
  backButton: { padding: 16 },
  backText: { color: "#ffffff", fontSize: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 24 },
  title: { color: "#ffffff", fontSize: 20, fontWeight: "700" },
  message: { color: "#ffffff", fontSize: 15, textAlign: "center" },
  hint: { color: "#bdbdbd", fontSize: 13, textAlign: "center" },
});
