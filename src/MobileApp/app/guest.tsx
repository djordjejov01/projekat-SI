import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function GuestScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/events');  // redirect na events screen
    }, 3000); // nakon 3 sekunde

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        You are browsing as a guest. Loading events...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20,
  },
  message: {
    fontSize: 18, fontWeight: '500', color: '#333', textAlign: 'center',
  },
});
