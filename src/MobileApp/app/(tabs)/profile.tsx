import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFavorites } from '../context/FavoriteContext';
import { useTranslation } from 'react-i18next';

export default function ProfileScreen() {
  const router = useRouter();
  const { favorites, clearFavorites, setGuestMode } = useFavorites();
  const { t } = useTranslation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      setIsLoggedIn(true);
      try {
        const res = await fetch('http://192.168.33.111:5216/api/MobileUser/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
          setEmail(data.email || '');
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const getInitials = () => {
    const firstInitial = firstName ? firstName[0].toUpperCase() : '';
    const lastInitial = lastName ? lastName[0].toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logoutTitle'),
      t('profile.logoutConfirm'),
      [
        { text: t('profile.cancel'), style: 'cancel' },
        {
          text: t('profile.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('token');
              clearFavorites();
              setGuestMode(true);
              router.replace('/');
            } catch (err) {
              console.error('Error during logout:', err);
              Alert.alert(t('profile.error'), t('profile.logoutError'));
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.header}>{t('profile.notLoggedIn')}</Text>
        <Text style={styles.message}>{t('profile.loginPrompt')}</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
          <Text style={styles.loginText}>{t('profile.loginNow')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('profile.title')}</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{`${firstName} ${lastName}`}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('../profile/personal-info')}>
          <Text style={styles.edit}>✏️ {t('profile.edit')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rowContainer}>
        <TouchableOpacity style={styles.statBox} onPress={() => router.push('../profile/tickets')}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>{t('profile.tickets')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statBox} onPress={() => router.push('/favorites')}>
          <Text style={styles.statNumber}>{favorites.length}</Text>
          <Text style={styles.statLabel}>{t('profile.favorites')}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>{t('profile.accountSettings')}</Text>

      <TouchableOpacity style={styles.option} onPress={() => router.push('../profile/personal-info')}>
        <Text>👤 {t('profile.personalInfo')}</Text>
        <Text style={styles.optionArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option}>
        <Text>📩 {t('profile.communication')}</Text>
        <Text style={styles.optionArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={() => router.push('../profile/change-password')}>
        <Text>🔒 {t('profile.changePassword')}</Text>
        <Text style={styles.optionArrow}>›</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>{t('profile.application')}</Text>

      <TouchableOpacity style={styles.option} onPress={() => router.push('../profile/about')}>
        <Text>❓ {t('profile.about')}</Text>
        <Text style={styles.optionArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={handleLogout}>
        <Text style={{ color: 'red' }}>🚪 {t('profile.logout')}</Text>
        <Text style={[styles.optionArrow, { color: 'red' }]}>›</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  avatarCircle: {
    backgroundColor: '#34D399',
    borderRadius: 40,
    width: 60,
    height: 60,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
  name: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
  email: {
    color: 'white',
    fontSize: 14,
  },
  edit: {
    color: 'white',
    textDecorationLine: 'underline',
    fontSize: 12,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statBox: {
    backgroundColor: '#F3F4F6',
    flex: 1,
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 6,
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  option: {
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionArrow: {
    fontSize: 18,
    fontWeight: '600',
  },
  message: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 20 },
  loginButton: {
    backgroundColor: '#7069E1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignSelf: 'center',
  },
  loginText: { color: '#fff', fontWeight: 'bold' },
  centeredContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#fff',
  padding: 20,
},

});
