import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '@/context/auth-context';

export default function LoginScreen() {
  const { user, signInWithGoogle, signInWithApple, isLoading } = useAuth();
  const router = useRouter();

  if (user) return <Redirect href="/(tabs)" />;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.inner}>
        <Text style={styles.title}>Parent Sign In</Text>
        <Text style={styles.subtitle}>Sign in to manage your family's chores</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color="#4285F4" style={styles.loader} />
        ) : (
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.googleButton} onPress={signInWithGoogle}>
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={8}
                style={styles.appleButton}
                onPress={signInWithApple}
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  back: {
    padding: 20,
    paddingTop: 60,
  },
  backText: {
    fontSize: 16,
    color: '#666',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    paddingBottom: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 48,
    textAlign: 'center',
  },
  buttons: {
    width: '100%',
    gap: 16,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  appleButton: {
    height: 48,
    width: '100%',
  },
  loader: {
    marginTop: 32,
  },
});
