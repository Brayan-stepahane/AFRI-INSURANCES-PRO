import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Footer } from '../../src/components/layout/Footer';
import { colors } from '../../src/config/theme';

export default function AuthLayout() {
  return (
    <View style={styles.container}>
      <View style={styles.stackWrapper}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="login" />
        </Stack>
      </View>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  stackWrapper: {
    flex: 1,
  },
});

