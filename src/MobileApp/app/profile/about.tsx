import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../../config';

export default function AboutSyncUpScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [imageLoading, setImageLoading] = useState(true); // ✅ Sada unutar komponente

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/profile')}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} />
          <Text style={styles.backText}></Text>
        </TouchableOpacity>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>SyncUp</Text>
        </View>
      </View>

      <View style={{ position: 'relative' }}>
        {imageLoading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        )}
        <Image
          source={{
            uri: `${API_URL}/images/about.jpg`,
          }}
          style={styles.image}
          onLoadEnd={() => setImageLoading(false)}
        />
      </View>

      <Text style={styles.heading}>{t('aboutScreen.heading')}</Text>
      <Text style={styles.paragraph}>{t('aboutScreen.description')}</Text>

      <Text style={styles.subheading}>{t('aboutScreen.missionTitle')}</Text>
      <Text style={styles.paragraph}>{t('aboutScreen.missionText')}</Text>

      <Text style={styles.subheading}>{t('aboutScreen.whyTitle')}</Text>
      <Text style={styles.paragraph}>{t('aboutScreen.whyText')}</Text>

      <Text style={styles.subheading}>{t('aboutScreen.locationTitle')}</Text>
      <Text style={styles.paragraph}>{t('aboutScreen.locationText')}</Text>

      <Text style={styles.subheading}>{t('aboutScreen.contactTitle')}</Text>
      <Text style={styles.paragraph}>{t('aboutScreen.contactText')}</Text>

      <Text style={styles.footer}>{t('aboutScreen.footer')}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 60,
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    marginLeft: 6,
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '500',
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
    marginLeft: -50,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 20,
  },
  loader: {
    position: 'absolute',
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111827',
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    color: '#1F2937',
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
  },
  footer: {
    marginTop: 30,
    fontSize: 13,
    textAlign: 'center',
    color: '#9CA3AF',
  },
});
