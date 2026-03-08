import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '@/context/auth-context';

export default function WelcomeScreen() {
  const { user, isInitializing } = useAuth();
  const router = useRouter();

  if (isInitializing) return null;
  if (user) return <Redirect href="/(tabs)" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chores</Text>
      <Text style={styles.subtitle}>Who are you?</Text>

      <View style={styles.cards}>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/login')}>
          <Text style={styles.cardEmoji}>👨‍👩‍👧</Text>
          <Text style={styles.cardTitle}>Parent</Text>
          <Text style={styles.cardDesc}>Manage chores and rewards for your family</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, styles.cardChild]} onPress={() => router.push('/join')}>
          <Text style={styles.cardEmoji}>🧒</Text>
          <Text style={styles.cardTitle}>Child</Text>
          <Text style={styles.cardDesc}>Join your family with a code from your parent</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 48,
  },
  cards: {
    width: '100%',
    gap: 16,
  },
  card: {
    backgroundColor: '#F0F7FF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D0E8FF',
  },
  cardChild: {
    backgroundColor: '#FFF7F0',
    borderColor: '#FFE0C0',
  },
  cardEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
