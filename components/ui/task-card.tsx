import { DbTask } from '@/lib/db';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function TaskCard({ task, onDelete }: { task: DbTask; onDelete: () => void }) {
  return (
    <View style={[styles.taskCard, task.completed && styles.taskCardCompleted]}>
      <View style={styles.taskLeft}>
        <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>{task.title}</Text>
        <Text style={styles.taskAssignee}>
          {task.assigned_to_name ? `👤 ${task.assigned_to_name}` : '⭕ Unassigned'}
        </Text>
      </View>
      <View style={styles.taskRight}>
        <Text style={styles.taskValue}>${task.value}</Text>
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.deleteBtn}>🗑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  taskCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  taskCardCompleted: { opacity: 0.5 },
  taskLeft: { flex: 1, marginRight: 12 },
  taskTitle: { fontSize: 15, fontWeight: '600', color: '#111' },
  taskTitleCompleted: { textDecorationLine: 'line-through', color: '#999' },
  taskAssignee: { fontSize: 12, color: '#888', marginTop: 3 },
  taskRight: { alignItems: 'flex-end', gap: 6 },
  taskValue: { fontSize: 15, fontWeight: '700', color: '#34A853' },
  deleteBtn: { fontSize: 16 },
});
