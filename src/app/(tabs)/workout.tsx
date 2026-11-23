import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
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

type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  detail: string;
};
type Routine = {
  id: string;
  name: string;
  durationMinutes: number;
  description: string;
  exercises: Exercise[];
};
type RoutineRow = {
  id: string;
  name: string;
  duration_minutes: number | null;
  description: string | null;
};
type ExerciseRow = {
  routine_id: string;
  exercise_id: string;
  name: string;
  muscle_group: string | null;
  sets: number | null;
  reps: number | null;
  duration_seconds: number | null;
  position: number;
};

export default function WorkoutScreen() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const { tokens } = useDesign();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const item = tokens.item;
  const isCard = item.style === "card";

  useEffect(() => {
    let mounted = true;
    Promise.all([
      db.getAllAsync<RoutineRow>(
        "SELECT id, name, duration_minutes, description FROM workout_routines ORDER BY id",
      ),
      db.getAllAsync<ExerciseRow>(
        `SELECT routine_exercises.routine_id, routine_exercises.exercise_id, exercises.name, exercises.muscle_group, routine_exercises.sets, routine_exercises.reps, routine_exercises.duration_seconds, routine_exercises.position FROM routine_exercises INNER JOIN exercises ON exercises.id = routine_exercises.exercise_id ORDER BY routine_exercises.routine_id, routine_exercises.position`,
      ),
    ])
      .then(([routineRows, exerciseRows]) => {
        if (!mounted) return;
        const next = routineRows.map((row) => ({
          id: row.id,
          name: row.name,
          durationMinutes: row.duration_minutes ?? 0,
          description: row.description ?? "",
          exercises: exerciseRows
            .filter((exercise) => exercise.routine_id === row.id)
            .map((exercise) => ({
              id: exercise.exercise_id,
              name: exercise.name,
              muscleGroup: exercise.muscle_group ?? "Full body",
              detail: formatPrescription(exercise),
            })),
        }));
        setRoutines(next);
        setSelectedId((current) => current ?? next[0]?.id ?? null);
      })
      .catch(() => {
        if (mounted) setRoutines([]);
      });
    return () => {
      mounted = false;
    };
  }, [db]);

  const routine =
    routines.find((entry) => entry.id === selectedId) ?? routines[0];

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
          {routine ? (
            <>
              <View
                style={[
                  styles.planCard,
                  {
                    backgroundColor: theme.accent,
                    borderColor: theme.border,
                    borderRadius: Math.max(item.radius, 16),
                    borderWidth: isCard ? item.borderWidth : 0,
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
                <Text
                  style={[styles.planDescription, { color: theme.onAccent }]}
                >
                  {routine.description}
                </Text>
                <View style={styles.planMeta}>
                  <Text style={[styles.metaText, { color: theme.onAccent }]}>
                    {routine.exercises.length} exercises
                  </Text>
                  <Text style={[styles.metaText, { color: theme.onAccent }]}>
                    {routine.durationMinutes} min
                  </Text>
                </View>
              </View>
              <Text
                style={[styles.sectionTitle, { color: theme.textSecondary }]}
              >
                ROUTINES
              </Text>
              <View style={styles.routineList}>
                {routines.map((option) => {
                  const selected = option.id === routine.id;
                  return (
                    <Pressable
                      key={option.id}
                      accessibilityRole='radio'
                      accessibilityState={{ selected }}
                      onPress={() => setSelectedId(option.id)}
                      style={[
                        styles.routineButton,
                        {
                          backgroundColor: selected
                            ? theme.tagBg
                            : "transparent",
                          borderColor: selected ? theme.accent : theme.border,
                          borderRadius: Math.max(item.radius, 10),
                          borderWidth: selected
                            ? Math.max(item.borderWidth, 2)
                            : 1,
                        },
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
                        {option.durationMinutes} min
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.exerciseHeader}>
                <Text
                  style={[styles.sectionTitle, { color: theme.textSecondary }]}
                >
                  EXERCISES
                </Text>
                <Text
                  style={[styles.exerciseCount, { color: theme.textMuted }]}
                >
                  {routine.exercises.length} total
                </Text>
              </View>
              <View style={styles.exerciseList}>
                {routine.exercises.map((exercise, index) => (
                  <View
                    key={exercise.id}
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
                        : {
                            borderBottomColor: theme.border,
                            borderBottomWidth: 1,
                          },
                    ]}
                  >
                    <View
                      style={[styles.number, { backgroundColor: theme.tagBg }]}
                    >
                      <Text
                        style={[styles.numberText, { color: theme.tagText }]}
                      >
                        {index + 1}
                      </Text>
                    </View>
                    <View style={styles.exerciseInfo}>
                      <Text
                        style={[typeStyle(item.text), { color: theme.text }]}
                      >
                        {exercise.name}
                      </Text>
                      <Text
                        style={[
                          styles.exerciseNote,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {exercise.muscleGroup}
                      </Text>
                    </View>
                    <Text
                      style={[styles.exerciseDetail, { color: theme.accent }]}
                    >
                      {exercise.detail}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={[styles.emptyState, { borderColor: theme.border }]}>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No workout routines yet
              </Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Download the resource pack to load workouts.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function formatPrescription(row: ExerciseRow) {
  return `${row.sets ?? 0} × ${row.duration_seconds ? `${row.duration_seconds} sec` : (row.reps ?? 0)}`;
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
  emptyState: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  emptyTitle: { fontSize: 16, lineHeight: 22, fontWeight: "800" },
  emptyText: { fontSize: 13, lineHeight: 19 },
});
