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

export default function ProfileScreen() {
  const router = useRouter();
  const { favorites } = useFavorites();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const res = await fetch('http://192.168.33.109:5216/api/User/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            router.replace('/');
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Profile</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{`${firstName} ${lastName}`}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('../profile/personal-info')}
        >
          <Text style={styles.edit}>✏️ Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rowContainer}>
        <TouchableOpacity
          style={styles.statBox}
          onPress={() => router.push('../profile/tickets')}
        >
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Tickets Purchased</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statBox}
          onPress={() => router.push('/favorites')}
        >
          <Text style={styles.statNumber}>{favorites.length}</Text>
          <Text style={styles.statLabel}>Favorite Events</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Account Settings</Text>

      <TouchableOpacity
        style={styles.option}
        onPress={() => router.push('../profile/personal-info')}
      >
        <Text>👤 Personal Information</Text>
        <Text style={styles.optionArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option}>
        <Text>📩 Communication Preferences</Text>
        <Text style={styles.optionArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.option}
        onPress={() => router.push('../profile/change-password')}
      >
        <Text>🔒 Change Password</Text>
        <Text style={styles.optionArrow}>›</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Application</Text>

      <TouchableOpacity
        style={styles.option}
        onPress={() => router.push('../profile/about')}
      >
        <Text>❓ About SyncUp</Text>
        <Text style={styles.optionArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={handleLogout}>
        <Text style={{ color: 'red' }}>🚪 Sign Out</Text>
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
});
