import React, { useEffect, useState } from 'react';
import i18n from '../i18n';
import { apiCall } from '../../config';
import { API_URL } from '../../config';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFavorites } from '../context/FavoriteContext';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { favorites, clearFavorites, setGuestMode } = useFavorites();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [ticketsCount, setTicketsCount] = useState(0);
  const [resourcesCount, setResourcesCount] = useState(0);

  const [credits, setCredits] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const defaultAvatar = require('../../assets/images/avatar_placeholder.png');

  const [selectedLang, setSelectedLang] = useState<'en' | 'sr'>('en');
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const normalizeImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    if (!path.startsWith('/')) path = `/${path}`;
    return `${API_URL}${path}`;
  };


useEffect(() => {
    const fetchUserDataAndStats = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);
      setIsLoading(true);

      try {
        // Fetch profile data
        const resProfile = await apiCall(`${API_URL}/api/MobileUser/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (resProfile.ok) {
          const data = await resProfile.json();
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
          setEmail(data.email || '');
          const imageUrl = normalizeImageUrl(data.profilePicture || null);
          setProfilePicture(imageUrl);
        } else {
          console.error('Failed to fetch profile data:', resProfile.status);
        }

        // Fetch tickets count
        const resTickets = await apiCall(`${API_URL}/api/ticket/tickets/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (resTickets.ok) {
          const data = await resTickets.json();
          setTicketsCount(data.length);
        } else {
          console.error('Failed to fetch tickets:', resTickets.status);
        }

        // Fetch resources count
        const resResources = await apiCall(`${API_URL}/api/Resource/my-reservations`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (resResources.ok) {
          const data = await resResources.json();
          const uniqueResources = new Set(data.map((r: { ResourceName: string }) => r.ResourceName));
          setResourcesCount(uniqueResources.size);
        } else {
          console.error('Failed to fetch resources:', resResources.status);
        }

        // Fetch credits
        const resCredits = await apiCall(`${API_URL}/api/Credit`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (resCredits.ok) {
          const data = await resCredits.json();
          
          if (data && typeof data.credits === 'number') {
            setCredits(data.credits);
          } else {
            console.warn('Credits field is missing or not a number:', data);
            setCredits(0);
          }
        } else {
          console.error('Failed to fetch credits. Status:', resCredits.status);
          const errorText = await resCredits.text();
          console.error('Response text:', errorText);
          setCredits(0);
        }

      } catch (err) {
        console.error('An unexpected error occurred during API calls:', err);
        // U slučaju bilo kakve greške, postavi kredite na 0 i prikaži grešku
        setCredits(0); 
      } finally {
        setIsLoading(false);
      }
    };

    const fetchLanguage = async () => {
      setSelectedLang(i18n.language === 'sr' ? 'sr' : 'en');
    };

    fetchUserDataAndStats();
    fetchLanguage();
  }, []);

  const handleLanguageSwitch = async (lang: 'en' | 'sr') => {
    await i18n.changeLanguage(lang);
    await i18n.services.languageDetector.cacheUserLanguage(lang);
    setSelectedLang(lang);
    setLanguageModalVisible(false);
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

  const renderProfileImage = () => (
    <TouchableOpacity onPress={() => setImageModalVisible(true)}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#fff" style={{ width: 68, height: 68 }} />
      ) : (
        <Image
          source={profilePicture ? { uri: profilePicture } : defaultAvatar}
          style={styles.avatarImage}
        />
      )}
    </TouchableOpacity>
  );

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
  {renderProfileImage()}
  <View style={{ flex: 1, marginLeft: 16 }}>
    <Text style={styles.name}>{`${firstName} ${lastName}`}</Text>
    <Text style={styles.email}>{email}</Text>
    <Text style={styles.credits}>{credits} RSD</Text>
  </View>
</View>

      <View style={styles.rowContainer}>
        <TouchableOpacity
          style={styles.statBox}
          onPress={() =>
            router.push({
              pathname: '../profile/myTickets',
              params: { from: 'profile' }, 
            })
          }
        >
          <Text style={styles.statNumber}>{ticketsCount}</Text>
          <Text style={styles.statLabel}>{t('profile.tickets')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statBox}
          onPress={() =>
            router.push({
              pathname: '../profile/myReservations',
              params: { from: 'profile' }, 
            })
          }
              >
          <Text style={styles.statNumber}>{resourcesCount}</Text>
          <Text style={styles.statLabel}>{t('profile.myReservations')}</Text>
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
        <Text>💳 {t('profile.payment')}</Text>
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
      <TouchableOpacity style={styles.option} onPress={() => setLanguageModalVisible(true)}>
        <Text>🌐 {t('profile.language')}</Text>
        <Text style={styles.optionArrow}>
          {selectedLang === 'en' ? '🇬🇧' : '🇷🇸'} ›
        </Text>
      </TouchableOpacity>


      <TouchableOpacity style={styles.option} onPress={handleLogout}>
        <Text style={{ color: 'red' }}>🚪 {t('profile.logout')}</Text>
        <Text style={[styles.optionArrow, { color: 'red' }]}>›</Text>
      </TouchableOpacity>

      <Modal visible={imageModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setImageModalVisible(false)}>
          <View style={styles.modalContent}>
            <Image
              source={profilePicture ? { uri: profilePicture } : defaultAvatar}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </View>
        </Pressable>
      </Modal>
        <Modal
    transparent
    animationType="fade"
    visible={languageModalVisible}
    onRequestClose={() => setLanguageModalVisible(false)}
  >
    <Pressable
      style={styles.modalOverlay}
      onPress={() => setLanguageModalVisible(false)}
    >
      <View style={styles.modalContent1}>
        <TouchableOpacity
          style={styles.langOption}
          onPress={() => handleLanguageSwitch('en')}
        >
          <Text style={styles.optionText}>🇬🇧 English</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.langOption}
          onPress={() => handleLanguageSwitch('sr')}
        >
          <Text style={styles.optionText}>🇷🇸 Srpski</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    paddingHorizontal: 24,
    paddingTop: 40, 
    paddingBottom: 20,
    backgroundColor: '#fff',
    justifyContent: 'space-between', 
  },
  header: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8, 
    textAlign: 'center',
    color: '#1a202c',
    letterSpacing: 0.8,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    padding: 16, 
    marginBottom: 20, 
    shadowColor: '#7c3aed',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 15,
    elevation: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24, 
  },
statBox: {
  backgroundColor: '#edeff1ff',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 16,
  marginHorizontal: 6,
  borderRadius: 16,
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 10,
  elevation: 3,
  minHeight: 90, 
},

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12, 
    color: '#2d3748',
  },
  option: {
    backgroundColor: '#edeff1ff',
    paddingVertical: 14, 
    paddingHorizontal: 16, 
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
 
  avatarImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#eee',
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
    lineHeight: 16,
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
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  justifyContent: 'center',
  alignItems: 'center',
},

modalBackground: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1,
},

modalContent: {
  zIndex: 2,
  backgroundColor: 'transparent',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 10,
},


  modalImage: {
    width: 300,
    height: 300,
    borderRadius: 12,
  },

credits: {
  color: 'white',
  fontSize: 18,
  fontWeight: '700',
  marginTop: 4,
},
langOption: {
  paddingVertical: 12,
  paddingHorizontal: 16,
},
optionText: {
  fontSize: 16,
  fontWeight: '500',
},
modalOverlay1: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.3)',
  justifyContent: 'flex-start',
  alignItems: 'flex-end',
  paddingTop: 80,
  paddingRight: 20,
},
modalContent1: {
  backgroundColor: '#fff',
  borderRadius: 10,
  paddingVertical: 10,
  width: 150,
  elevation: 4,
},


});
