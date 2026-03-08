import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/auth-context';

const POLL_INTERVAL_MS = 5000;

export default function PendingScreen() {
  const { user, refreshChildStatus, signOut } = useAuth();

  // Keep a ref that always points to the latest refreshChildStatus.
  // This lets the interval call the up-to-date function without restarting.
  const refreshRef = useRef(refreshChildStatus);
  useEffect(() => { refreshRef.current = refreshChildStatus; });

  useEffect(() => {
    const id = setInterval(() => refreshRef.current(), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  // Once approved, the status in context flips to 'active' — redirect to tabs
  if (user?.status === 'active') return <Redirect href="/(tabs)" />;
  if (!user) return <Redirect href="/welcome" />;

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⏳</Text>
      <Text style={styles.title}>Waiting for Approval</Text>
      <Text style={styles.subtitle}>
        Hi <Text style={styles.name}>{user.name}</Text>! Your parent needs to approve your request
        before you can see the family's chores.
      </Text>

      <View style={styles.codeBox}>
        <Text style={styles.codeLabel}>Family join code</Text>
        <Text style={styles.code}>{user.joinCode}</Text>
      </View>

      <ActivityIndicator color="#FF8C42" style={styles.spinner} />
      <Text style={styles.hint}>Checking automatically every few seconds…</Text>

      <TouchableOpacity style={styles.refreshBtn} onPress={refreshChildStatus}>
        <Text style={styles.refreshText}>Check now</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelBtn} onPress={signOut}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  name: { fontWeight: '700', color: '#FF8C42' },
  codeBox: {
    backgroundColor: '#FFF7F0',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFD0A0',
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    marginBottom: 32,
  },
  codeLabel: { fontSize: 11, fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: 1 },
  code: { fontSize: 28, fontWeight: '800', letterSpacing: 4, color: '#FF8C42', marginTop: 4 },
  spinner: { marginBottom: 8 },
  hint: { fontSize: 13, color: '#aaa', marginBottom: 24 },
  refreshBtn: {
    backgroundColor: '#FF8C42',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginBottom: 12,
  },
  refreshText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelBtn: { padding: 8 },
  cancelText: { color: '#aaa', fontSize: 14 },
});
