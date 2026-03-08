import { useAuth } from '@/context/auth-context';
import { createTask, DbFamilyMember, DbTask, deleteTask, getPendingMembers, getTasksForFamily, updateMemberStatus } from '@/lib/db';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { TaskCard } from './task-card';

export function ParentDashboard() {
  const { user, signOut } = useAuth();
  const [tasks, setTasks] = useState<DbTask[]>([]);
  const [pendingMembers, setPendingMembers] = useState<DbFamilyMember[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskValue, setTaskValue] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.familyId) return;
    setLoadingTasks(true);
    try {
      const [t, p] = await Promise.all([
        getTasksForFamily(user.familyId),
        getPendingMembers(user.familyId),
      ]);
      setTasks(t);
      setPendingMembers(p);
    } catch (_e) {
      Alert.alert('Error', 'Failed to load data.');
    } finally {
      setLoadingTasks(false);
    }
  }, [user?.familyId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAddTask = async () => {
    if (!taskTitle.trim() || !user?.familyId) return;
    setSaving(true);
    try {
      const task = await createTask(
        user.familyId,
        taskTitle.trim(),
        Number(taskValue) || 0,
        taskAssignee.trim() || null,
      );
      setTasks(prev => [task, ...prev]);
      setShowAddTask(false);
      setTaskTitle(''); setTaskValue(''); setTaskAssignee('');
    } catch (_e) {
      Alert.alert('Error', 'Failed to add task.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (_e) {
      Alert.alert('Error', 'Failed to delete task.');
    }
  };

  const handleMemberAction = async (member: DbFamilyMember, status: 'approved' | 'rejected') => {
    try {
      await updateMemberStatus(member.id, status);
      setPendingMembers(prev => prev.filter(m => m.id !== member.id));
    } catch (_e) {
      Alert.alert('Error', `Failed to ${status === 'approved' ? 'approve' : 'reject'} request.`);
    }
  };

  const unassigned = tasks.filter(t => !t.assigned_to_name && !t.completed);
  const assigned = tasks.filter(t => t.assigned_to_name && !t.completed);
  const completed = tasks.filter(t => t.completed);

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name ?? 'Parent'} 👋</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </View>

        {/* Join Code */}
        {user?.joinCode && (
          <View style={styles.joinCard}>
            <Text style={styles.joinLabel}>Family Join Code</Text>
            <Text style={styles.joinCode}>{user.joinCode}</Text>
            <Text style={styles.joinHint}>Share with your children so they can join</Text>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={() => Share.share({ message: `Join our family on Chores! Code: ${user.joinCode}` })}
            >
              <Text style={styles.shareBtnText}>Share Code</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Pending Requests */}
        {pendingMembers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Join Requests 🔔</Text>
            {pendingMembers.map(member => (
              <View key={member.id} style={styles.requestCard}>
                <View style={styles.requestInfo}>
                  <Text style={styles.requestName}>{member.name}</Text>
                  <Text style={styles.requestTime}>wants to join your family</Text>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => handleMemberAction(member, 'approved')}
                  >
                    <Text style={styles.approveBtnText}>✓ Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleMemberAction(member, 'rejected')}
                  >
                    <Text style={styles.rejectBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tasks</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddTask(true)}>
              <Text style={styles.addBtnText}>+ Add Task</Text>
            </TouchableOpacity>
          </View>

          {loadingTasks ? (
            <ActivityIndicator style={{ marginTop: 24 }} color="#4285F4" />
          ) : tasks.length === 0 ? (
            <Text style={styles.empty}>No tasks yet. Tap "+ Add Task" to create one.</Text>
          ) : (
            <>
              {assigned.length > 0 && <>
                <Text style={styles.groupLabel}>Assigned</Text>
                {assigned.map(t => <TaskCard key={t.id} task={t} onDelete={() => handleDeleteTask(t.id)} />)}
              </>}
              {unassigned.length > 0 && <>
                <Text style={styles.groupLabel}>Unassigned</Text>
                {unassigned.map(t => <TaskCard key={t.id} task={t} onDelete={() => handleDeleteTask(t.id)} />)}
              </>}
              {completed.length > 0 && <>
                <Text style={styles.groupLabel}>Completed</Text>
                {completed.map(t => <TaskCard key={t.id} task={t} onDelete={() => handleDeleteTask(t.id)} />)}
              </>}
            </>
          )}
        </View>
      </ScrollView>

      {/* Add Task Modal */}
      <Modal visible={showAddTask} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Task</Text>
            <TouchableOpacity onPress={() => setShowAddTask(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.inputLabel}>Title</Text>
          <TextInput style={styles.input} placeholder="e.g. Wash the dishes" placeholderTextColor="#aaa" value={taskTitle} onChangeText={setTaskTitle} />
          <Text style={styles.inputLabel}>Reward ($)</Text>
          <TextInput style={styles.input} placeholder="e.g. 5" placeholderTextColor="#aaa" keyboardType="numeric" value={taskValue} onChangeText={setTaskValue} />
          <Text style={styles.inputLabel}>Assign to child (optional)</Text>
          <TextInput style={styles.input} placeholder="e.g. Emma" placeholderTextColor="#aaa" value={taskAssignee} onChangeText={setTaskAssignee} />
          {saving ? (
            <ActivityIndicator style={{ marginTop: 32 }} color="#4285F4" />
          ) : (
            <TouchableOpacity
              style={[styles.saveBtn, !taskTitle.trim() && styles.saveBtnDisabled]}
              onPress={handleAddTask}
              disabled={!taskTitle.trim()}
            >
              <Text style={styles.saveBtnText}>Add Task</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F8FA' },
  container: { padding: 20, paddingTop: 60, paddingBottom: 40 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#111' },
  email: { fontSize: 13, color: '#888', marginTop: 2 },
  signOutBtn: { backgroundColor: '#F0F0F0', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  signOutText: { fontSize: 13, color: '#555', fontWeight: '600' },

  joinCard: { backgroundColor: '#EEF6FF', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#C8E0FF', alignItems: 'center' },
  joinLabel: { fontSize: 12, color: '#555', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  joinCode: { fontSize: 36, fontWeight: '800', letterSpacing: 6, color: '#1A73E8', marginVertical: 8 },
  joinHint: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 12 },
  shareBtn: { backgroundColor: '#1A73E8', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 10 },
  shareBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 12 },
  groupLabel: { fontSize: 12, fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 4 },
  addBtn: { backgroundColor: '#4285F4', paddingVertical: 7, paddingHorizontal: 14, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  empty: { color: '#999', fontSize: 14, textAlign: 'center', marginTop: 12, marginBottom: 8 },

  requestCard: { backgroundColor: '#FFF8E7', borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#FFE5A0' },
  requestInfo: { flex: 1 },
  requestName: { fontSize: 15, fontWeight: '700', color: '#111' },
  requestTime: { fontSize: 12, color: '#888', marginTop: 2 },
  requestActions: { flexDirection: 'row', gap: 8 },
  approveBtn: { backgroundColor: '#34A853', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  approveBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  rejectBtn: { backgroundColor: '#F0F0F0', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  rejectBtnText: { color: '#888', fontWeight: '700', fontSize: 13 },

  modal: { flex: 1, padding: 24, paddingTop: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  modalTitle: { fontSize: 22, fontWeight: '700' },
  modalClose: { fontSize: 20, color: '#999' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14, fontSize: 15, marginBottom: 18, backgroundColor: '#FAFAFA' },
  saveBtn: { backgroundColor: '#4285F4', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveBtnDisabled: { backgroundColor: '#B0C8F8' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
