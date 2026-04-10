import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { seedFirestore } from './src/core/firebaseSeeder';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    seedFirestore()
      .catch((e) => console.warn('[App] seed error:', e?.message))
      .finally(() => setIsReady(true));
  }, []);

  if (!isReady) {
    return (
      <View style={styles.splash}>
        <Text style={styles.emoji}></Text>
        <Text style={styles.title}>MovieApp</Text>
        <ActivityIndicator size="large" color="#FF9EBB" style={{ marginTop: 20 }} />
        <Text style={styles.sub}>Kết nối Firebase...</Text>
      </View>
    );
  }

  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#0B0C10', paddingHorizontal: 24,
  },
  emoji: { fontSize: 72 },
  title: { fontSize: 32, fontWeight: '900', color: '#FFD700', marginTop: 12 },
  sub:   { color: '#94A3B8', marginTop: 12, fontWeight: '600' },
});
