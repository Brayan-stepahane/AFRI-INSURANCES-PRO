import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { colors, spacing } from '../../config/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login({ email, password });
      router.replace('/(app)/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button title={isLoading ? 'Loading...' : 'Login'} onPress={handleLogin} disabled={isLoading} />

      <Button
        title="Create Account"
        variant="secondary"
        onPress={() => router.push('/(auth)/register')}
        style={styles.registerButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  registerButton: {
    marginTop: spacing.md,
  },
});
