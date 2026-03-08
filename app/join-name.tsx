import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { useAuth } from '@/context/auth-context';

export default function JoinNameScreen() {
  const { familyId, joinCode } = useLocalSearchParams<{ familyId: string; joinCode: string }>();
  const { submitChildRequest, isLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    try {
      const childId = Crypto.randomUUID();
      await submitChildRequest(name.trim(), familyId, joinCode, childId);
      // auth-context sets user with status:'pending', tabs layout redirects to /pending
    } catch (_e) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.emoji}>👋</Text>
        <Text style={styles.title}>What's your name?</Text>
        <Text style={styles.subtitle}>
          Your parent will see this name when approving your request
        </Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={(t) => { setName(t); setError(null); }}
          placeholder="e.g. Emma"
          placeholderTextColor="#aaa"
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          autoFocus
        />

        {error && <Text style={styles.error}>{error}</Text>}

        {isLoading ? (
          <ActivityIndicator size="large" color="#FF8C42" style={styles.loader} />
        ) : (
          <TouchableOpacity
            style={[styles.button, !name.trim() && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!name.trim()}
          >
            <Text style={styles.buttonText}>Request to Join</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  back: { padding: 20, paddingTop: 60 },
  backText: { fontSize: 16, color: '#666' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, paddingBottom: 80 },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 40 },
  input: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#FFD0A0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 20,
    textAlign: 'center',
    backgroundColor: '#FFF7F0',
    marginBottom: 12,
  },
  error: { color: '#D9534F', fontSize: 14, marginBottom: 12, textAlign: 'center' },
  button: {
    backgroundColor: '#FF8C42',
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { backgroundColor: '#FFCBA0' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  loader: { marginTop: 16 },
});
