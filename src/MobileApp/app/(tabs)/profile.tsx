import React, { useEffect, useState } from 'react';
import { API_URL } from '../../config';
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
  const [ticketsCount, setTicketsCount] = useState(0);
  const [credits, setCredits] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchUserDataAndTickets = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      setIsLoggedIn(true);

      try {
        const res = await fetch(`${API_URL}/MobileUser/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
          setEmail(data.email || '');
        }

        const resTickets = await fetch(`${API_URL}/ticket/tickets/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (resTickets.ok) {
          const dataCount = await resTickets.json();
          setTicketsCount(dataCount.length);
        }

        const resCredits = await fetch(`${API_URL}/Credit`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (resCredits.ok) {
          const data = await resCredits.json();
          setCredits(data.credits);
        }

      } catch (error) {
        console.error('Failed to load user data or tickets:', error);
      }
    };

    fetchUserDataAndTickets();
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
          <Text style={styles.edit}>💰 {credits}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rowContainer}>
        <TouchableOpacity style={styles.statBox} onPress={() => router.push('../profile/myTickets')}>
          <Text style={styles.statNumber}>{ticketsCount}</Text>
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

      <TouchableOpacity style={styles.option} onPress={() => router.push('../profile/token')}> 
        <Text>💳 {t('Token Store')}</Text>
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
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,      // više prostora dole za komfor
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,           // veći naslov
    fontWeight: '900',
    marginBottom: 24,       // veći razmak ispod naslova
    textAlign: 'center',
    color: '#1a202c',
    letterSpacing: 0.8,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7c3aed',  // malo tamniji ljubičasti za više "wow" efekta
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    shadowColor: '#7c3aed',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 15,
    elevation: 10,
  },
  avatarCircle: {
    backgroundColor: '#10b981',
    borderRadius: 40,
    width: 68,
    height: 68,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 6,
  },
  avatarText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 22,
  },
  name: {
    color: 'white',
    fontWeight: '900',
    fontSize: 20,
  },
  email: {
    color: 'white',
    fontSize: 15,
    marginTop: 4,
  },
  edit: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statBox: {
    backgroundColor: '#edeff1ff',
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    marginHorizontal: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 6,
    color: '#4a5568',
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 16,
    color: '#2d3748',
  },
  option: {
    backgroundColor: '#edeff1ff',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  optionArrow: {
    fontSize: 20,
    fontWeight: '700',
    color: '#9ca3af',
  },
  message: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 28,
  },
  loginButton: {
    backgroundColor: '#6d28d9',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignSelf: 'center',
    shadowColor: '#6d28d9',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 15,
    elevation: 7,
  },
  loginText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
});
