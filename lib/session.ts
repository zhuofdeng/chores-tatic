import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser } from '@/context/auth-context';

const SESSION_KEY = 'chores_session';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

type StoredSession = {
  user: AuthUser;
  expiresAt: number;
};

export async function saveSession(user: AuthUser): Promise<void> {
  const session: StoredSession = {
    user,
    expiresAt: Date.now() + THIRTY_DAYS_MS,
  };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function loadSession(): Promise<AuthUser | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: StoredSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      await AsyncStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session.user;
  } catch (_e) {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
