import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function GuestScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (i18n.isInitialized) {
      setReady(true);
    } else {
      i18n.on('initialized', () => {
        setReady(true);
      });
    }

    const timer = setTimeout(() => {
      router.replace('/events');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!ready) {
    return null; 
  }

  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        {t('guest.loadingMessage')}
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
