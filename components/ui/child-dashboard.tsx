import { useAuth } from '@/context/auth-context';
import { claimTask, DbTask, getTasksForFamily } from '@/lib/db';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function ChildDashboard() {
  const { user, signOut } = useAuth();
  const [tasks, setTasks] = useState<DbTask[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    if (!user?.familyId) return;
    setLoading(true);
    try {
      setTasks((await getTasksForFamily(user.familyId)).filter(t => !t.completed));
    } catch (_e) {
      Alert.alert('Error', 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [user?.familyId]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleClaim = async (task: DbTask) => {
    if (!user?.name) return;
    try {
      await claimTask(task.id, user.name);
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, assigned_to_name: user.name } : t));
    } catch (_e) {
      Alert.alert('Error', 'Could not claim task — someone may have just taken it.');
      loadTasks();
    }
  };

  const myTasks = tasks.filter(t => t.assigned_to_name === user?.name);
  const availableTasks = tasks.filter(t => !t.assigned_to_name);
  const othersTasks = tasks.filter(t => t.assigned_to_name && t.assigned_to_name !== user?.name);

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi, {user?.name ?? 'there'} 👋</Text>
            <Text style={styles.email}>Family code: {user?.joinCode}</Text>
            <Text style={styles.description}>Your Total Earnings: ${tasks.filter(t => t.assigned_to_name === user?.name && t.completed).reduce((sum, t) => sum + t.value, 0).toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color="#FF8C42" />
        ) : (
          <>
            {/* My Tasks */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My Tasks</Text>
              {myTasks.length === 0 ? (
                <Text style={styles.empty}>You haven't claimed any tasks yet.</Text>
              ) : (
                myTasks.map(task => (
                  <View key={task.id} style={styles.taskCard}>
                    <View style={styles.taskLeft}>
                      <Text style={styles.taskTitle}>{task.title}</Text>
                      <Text style={styles.taskAssignee}>Claimed by you</Text>
                    </View>
                    <Text style={styles.taskValue}>${task.value}</Text>
                  </View>
                ))
              )}
            </View>

            {/* Available Tasks */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Tasks</Text>
              {availableTasks.length === 0 ? (
                <Text style={styles.empty}>No tasks available right now.</Text>
              ) : (
                availableTasks.map(task => (
                  <View key={task.id} style={[styles.taskCard, styles.availableCard]}>
                    <View style={styles.taskLeft}>
                      <Text style={styles.taskTitle}>{task.title}</Text>
                      <Text style={styles.taskAssignee}>⭕ Available</Text>
                    </View>
                    <View style={styles.taskRight}>
                      <Text style={styles.taskValue}>${task.value}</Text>
                      <TouchableOpacity style={styles.claimBtn} onPress={() => handleClaim(task)}>
                        <Text style={styles.claimBtnText}>Claim</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Others' Tasks */}
            {othersTasks.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Taken</Text>
                {othersTasks.map(task => (
                  <View key={task.id} style={[styles.taskCard, styles.takenCard]}>
                    <View style={styles.taskLeft}>
                      <Text style={[styles.taskTitle, { color: '#aaa' }]}>{task.title}</Text>
                      <Text style={styles.taskAssignee}>👤 {task.assigned_to_name}</Text>
                    </View>
                    <Text style={[styles.taskValue, { color: '#bbb' }]}>${task.value}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F8FA' },
  container: { padding: 20, paddingTop: 60, paddingBottom: 40 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#111' },
  email: { fontSize: 13, color: '#888', marginTop: 2 },
  description: { fontSize: 13, color: '#888', marginTop: 2 },
  signOutBtn: { backgroundColor: '#F0F0F0', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  signOutText: { fontSize: 13, color: '#555', fontWeight: '600' },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 12 },
  empty: { color: '#999', fontSize: 14, textAlign: 'center', marginTop: 12, marginBottom: 8 },

  taskCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  availableCard: { borderWidth: 1.5, borderColor: '#D0F0E0' },
  takenCard: { opacity: 0.5 },
  taskLeft: { flex: 1, marginRight: 12 },
  taskTitle: { fontSize: 15, fontWeight: '600', color: '#111' },
  taskAssignee: { fontSize: 12, color: '#888', marginTop: 3 },
  taskRight: { alignItems: 'flex-end', gap: 6 },
  taskValue: { fontSize: 15, fontWeight: '700', color: '#34A853' },
  claimBtn: { backgroundColor: '#FF8C42', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8, marginTop: 4 },
  claimBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
