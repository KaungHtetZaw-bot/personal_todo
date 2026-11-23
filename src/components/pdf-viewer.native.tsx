import { StyleSheet } from "react-native";
import Pdf from "react-native-pdf";

export default function PdfViewer({ uri, onError }: { uri: string; onError: () => void }) {
  return (
    <Pdf
      source={{ uri, cache: false }}
      style={styles.pdf}
      trustAllCerts={false}
      enablePaging={false}
      onError={onError}
    />
  );
}

const styles = StyleSheet.create({
  pdf: { flex: 1, backgroundColor: "#333333" },
});
