import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  MaxContentWidth,
  Spacing,
  boxShadow,
  typeStyle,
  useDesign,
  useTheme,
} from "@/theme";

type Exercise = { name: string; detail: string; note: string };
type Routine = {
  id: string;
  name: string;
  duration: string;
  description: string;
  exercises: Exercise[];
};

const ROUTINES: Routine[] = [
  {
    id: "full-body",
    name: "Full body",
    duration: "25 min",
    description: "A balanced session for strength and energy.",
    exercises: [
      { name: "Bodyweight squats", detail: "3 × 12", note: "Legs" },
      { name: "Push-ups", detail: "3 × 8", note: "Chest · arms" },
      {
        name: "Mountain climbers",
        detail: "3 × 30 sec",
        note: "Core · cardio",
      },
      { name: "Plank", detail: "3 × 30 sec", note: "Core" },
    ],
  },
  {
    id: "upper-body",
    name: "Upper body",
    duration: "20 min",
    description: "Focused work for your chest, back, and arms.",
    exercises: [
      { name: "Push-ups", detail: "4 × 8", note: "Chest · arms" },
      { name: "Pike push-ups", detail: "3 × 8", note: "Shoulders" },
      {
        name: "Plank shoulder taps",
        detail: "3 × 20",
        note: "Core · shoulders",
      },
    ],
  },
  {
    id: "mobility",
    name: "Mobility",
    duration: "15 min",
    description: "Move well and reset after a long day.",
    exercises: [
      { name: "Cat-cow stretch", detail: "2 × 45 sec", note: "Back" },
      {
        name: "World's greatest stretch",
        detail: "2 × 5 / side",
        note: "Hips · back",
      },
      { name: "Child's pose", detail: "2 × 60 sec", note: "Recovery" },
    ],
  },
];

export default function WorkoutScreen() {
  const theme = useTheme();
  const { tokens } = useDesign();
  const [selectedId, setSelectedId] = useState(ROUTINES[0].id);
  const routine =
    ROUTINES.find((item) => item.id === selectedId) ?? ROUTINES[0];
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
              Workout
            </Text>
            <Text
              style={[
                typeStyle(tokens.subtitle),
                { color: theme.textSecondary },
              ]}
            >
              Choose a routine and get moving.
            </Text>
          </View>

          <View
            style={[
              styles.planCard,
              {
                backgroundColor: theme.accent,
                borderColor: theme.border,
                borderRadius: Math.max(item.radius, 16),
                borderWidth: item.style === "card" ? item.borderWidth : 0,
                boxShadow: boxShadow(item.shadow, theme.shadow),
              },
            ]}
          >
            <Text style={[styles.eyebrow, { color: theme.onAccent }]}>
              TODAY&apos;S PLAN
            </Text>
            <Text style={[styles.planTitle, { color: theme.onAccent }]}>
              {routine.name}
            </Text>
            <Text style={[styles.planDescription, { color: theme.onAccent }]}>
              {routine.description}
            </Text>
            <View style={styles.planMeta}>
              <Text style={[styles.metaText, { color: theme.onAccent }]}>
                {routine.exercises.length} exercises
              </Text>
              <Text style={[styles.metaText, { color: theme.onAccent }]}>
                {routine.duration}
              </Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            ROUTINES
          </Text>
          <View style={styles.routineList}>
            {ROUTINES.map((option) => {
              const selected = option.id === routine.id;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole='radio'
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${option.name} routine`}
                  onPress={() => setSelectedId(option.id)}
                  style={({ pressed }) => [
                    styles.routineButton,
                    {
                      backgroundColor: selected ? theme.tagBg : "transparent",
                      borderColor: selected ? theme.accent : theme.border,
                      borderRadius: Math.max(item.radius, 10),
                      borderWidth: selected ? Math.max(item.borderWidth, 2) : 1,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.routineName,
                      { color: selected ? theme.accent : theme.text },
                    ]}
                  >
                    {option.name}
                  </Text>
                  <Text
                    style={[
                      styles.routineDuration,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {option.duration}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.exerciseHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              EXERCISES
            </Text>
            <Text style={[styles.exerciseCount, { color: theme.textMuted }]}>
              {routine.exercises.length} total
            </Text>
          </View>

          <View style={styles.exerciseList}>
            {routine.exercises.map((exercise, index) => (
              <View
                key={exercise.name}
                style={[
                  styles.exerciseRow,
                  isCard
                    ? {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                        borderRadius: item.radius,
                        borderWidth: item.borderWidth,
                        boxShadow: boxShadow(item.shadow, theme.shadow),
                      }
                    : { borderBottomColor: theme.border, borderBottomWidth: 1 },
                ]}
              >
                <View style={[styles.number, { backgroundColor: theme.tagBg }]}>
                  <Text style={[styles.numberText, { color: theme.tagText }]}>
                    {index + 1}
                  </Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={[typeStyle(item.text), { color: theme.text }]}>
                    {exercise.name}
                  </Text>
                  <Text
                    style={[
                      styles.exerciseNote,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {exercise.note}
                  </Text>
                </View>
                <Text style={[styles.exerciseDetail, { color: theme.accent }]}>
                  {exercise.detail}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", justifyContent: "center" },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
  },
  scroll: { flex: 1 },
  content: { paddingBottom: Spacing.six },
  header: { gap: Spacing.one, paddingBottom: Spacing.four },
  planCard: {
    padding: Spacing.four,
    gap: Spacing.one,
    marginBottom: Spacing.four,
  },
  eyebrow: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  planTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    marginTop: Spacing.one,
  },
  planDescription: { fontSize: 14, lineHeight: 20, opacity: 0.9 },
  planMeta: {
    flexDirection: "row",
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
  metaText: { fontSize: 12, lineHeight: 17, fontWeight: "700" },
  sectionTitle: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    letterSpacing: 1,
  },
  routineList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
  routineButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    flexGrow: 1,
    flexBasis: "30%",
  },
  routineName: { fontSize: 14, lineHeight: 19, fontWeight: "800" },
  routineDuration: { fontSize: 11, lineHeight: 15, marginTop: 2 },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseCount: { fontSize: 12, lineHeight: 16 },
  exerciseList: { gap: Spacing.two, marginTop: Spacing.two },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  number: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: { fontSize: 13, lineHeight: 18, fontWeight: "800" },
  exerciseInfo: { flex: 1, gap: 2 },
  exerciseNote: { fontSize: 12, lineHeight: 16 },
  exerciseDetail: { fontSize: 13, lineHeight: 18, fontWeight: "800" },
  pressed: { opacity: 0.7 },
});
