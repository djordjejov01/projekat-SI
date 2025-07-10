import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AboutSyncUpScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header with back arrow and centered title */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/profile')}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24}  />
          <Text style={styles.backText}></Text>
        </TouchableOpacity>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>SyncUp</Text>
        </View>
      </View>

      {/* Ilustracija */}
      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1050&q=80',
        }}
        style={styles.image}
      />

      <Text style={styles.heading}>About us</Text>
      <Text style={styles.paragraph}>
        SyncUp is your ultimate event companion. We help people find, attend,
        and stay informed about events they love – from concerts and tech
        meetups to workshops and art festivals.
      </Text>

      <Text style={styles.subheading}>🌟 Our Mission</Text>
      <Text style={styles.paragraph}>
        To connect people through shared experiences. Whether you’re into music,
        technology, art, or education – SyncUp makes sure you never miss out.
      </Text>

      <Text style={styles.subheading}>🚀 Why SyncUp?</Text>
      <Text style={styles.paragraph}>
        - Discover personalized events near you{'\n'}
        - Save your favorites and buy tickets seamlessly{'\n'}
        - Stay updated with schedules, maps & agendas{'\n'}
        - Enjoy an intuitive, user-friendly experience
      </Text>

      <Text style={styles.subheading}>📍 Where We’re Based</Text>
      <Text style={styles.paragraph}>
        Kragujevac, Serbia – but SyncUp is built to connect people everywhere.
      </Text>

      <Text style={styles.subheading}>📬 Contact Us</Text>
      <Text style={styles.paragraph}>
        Email: contact@syncup.rs{'\n'}
        Instagram: @syncup.events{'\n'}
        LinkedIn: SyncUp Team
      </Text>

      <Text style={styles.footer}>© 2025 SyncUp. All rights reserved.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 60,
    marginTop:30
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
