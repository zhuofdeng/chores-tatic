import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import {
  createParentWithFamily,
  createMemberRequest,
  getMemberByChildId,
  loadParentData,
} from '@/lib/db';
import { saveSession, loadSession, clearSession } from '@/lib/session';

WebBrowser.maybeCompleteAuthSession();

export type AuthUser = {
  id: string;
  name: string | null;
  email: string | null;
  provider: 'google' | 'apple' | 'join-code';
  userType: 'parent' | 'child';
  familyId: string | null;
  joinCode: string | null;
  /** Parents are always 'active'. Children start as 'pending' until approved. */
  status: 'active' | 'pending';
};

type AuthContextType = {
  user: AuthUser | null;
  /** True while restoring a saved session on app launch — show a loader, not a redirect. */
  isInitializing: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  submitChildRequest: (name: string, familyId: string, joinCode: string, childId: string) => Promise<void>;
  refreshChildStatus: () => Promise<void>;
  signOut: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // ─── Restore saved session on launch ─────────────────────────────────────────

  useEffect(() => {
    loadSession().then(saved => {
      if (saved) setUser(saved);
    }).finally(() => setIsInitializing(false));
  }, []);

  // ─── Persist session whenever user changes (after initialization) ─────────────

  useEffect(() => {
    if (isInitializing) return;
    if (user) {
      saveSession(user);
    } else {
      clearSession();
    }
  }, [user, isInitializing]);

  // ─── Google OAuth ─────────────────────────────────────────────────────────────

  // Replace these with your actual OAuth client IDs from Google Cloud Console:
  // https://console.cloud.google.com/apis/credentials
  const [, response, promptAsync] = Google.useAuthRequest({
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    webClientId: '819543982690-edg35ar73c5uvfhnkd82icko28as3dgq.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      fetchGoogleUser(response.authentication?.accessToken);
    }
  }, [response]);

  // ─── Shared: look up or create a parent profile in Supabase ─────────────────

  async function resolveParentProfile(
    id: string,
    name: string | null,
    email: string | null,
    provider: 'google' | 'apple',
  ): Promise<AuthUser> {
    const existing = await loadParentData(id);
    if (existing) {
      return {
        id: existing.profile.id,
        name: existing.profile.name,
        email: existing.profile.email,
        provider,
        userType: 'parent',
        familyId: existing.profile.family_id,
        joinCode: existing.family?.join_code ?? null,
        status: 'active',
      };
    }
    const { profile, family } = await createParentWithFamily(id, name, email, provider);
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      provider,
      userType: 'parent',
      familyId: profile.family_id,
      joinCode: family.join_code,
      status: 'active',
    };
  }

  // ─── Google ──────────────────────────────────────────────────────────────────

  const fetchGoogleUser = async (token: string | undefined) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(await resolveParentProfile(data.id, data.name ?? null, data.email ?? null, 'google'));
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => { await promptAsync(); };

  // ─── Apple ───────────────────────────────────────────────────────────────────

  const signInWithApple = async () => {
    setIsLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const givenName = credential.fullName?.givenName ?? '';
      const familyName = credential.fullName?.familyName ?? '';
      const fullName = `${givenName} ${familyName}`.trim() || null;
      setUser(await resolveParentProfile(credential.user, fullName, credential.email ?? null, 'apple'));
    } catch (e: unknown) {
      if ((e as { code?: string }).code !== 'ERR_REQUEST_CANCELED') throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Child: two-step join ────────────────────────────────────────────────────

  const submitChildRequest = async (
    name: string,
    familyId: string,
    joinCode: string,
    childId: string,
  ) => {
    setIsLoading(true);
    try {
      await createMemberRequest(familyId, childId, name);
      setUser({
        id: childId,
        name,
        email: null,
        provider: 'join-code',
        userType: 'child',
        familyId,
        joinCode,
        status: 'pending',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshChildStatus = useCallback(async () => {
    if (!user || user.userType !== 'child') return;
    try {
      const member = await getMemberByChildId(user.id);
      if (member?.status === 'approved') {
        setUser(prev => prev ? { ...prev, status: 'active' } : null);
      } else if (member?.status === 'rejected') {
        setUser(null);
      }
    } catch (_e) {
      // silently ignore network errors on background poll
    }
  }, [user]);

  const signOut = () => setUser(null);

  return (
    <AuthContext.Provider value={{
      user,
      isInitializing,
      signInWithGoogle,
      signInWithApple,
      submitChildRequest,
      refreshChildStatus,
      signOut,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
