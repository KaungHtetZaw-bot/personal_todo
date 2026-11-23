import { StyleSheet, Text, View } from "react-native";

export default function PdfViewer({ uri }: { uri: string; onError: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.message}>In-app PDF reading is available in the Android/iOS build.</Text>
      <Text style={styles.hint}>{uri}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 24 },
  message: { color: "#ffffff", fontSize: 15, textAlign: "center" },
  hint: { color: "#bdbdbd", fontSize: 11, textAlign: "center" },
});
