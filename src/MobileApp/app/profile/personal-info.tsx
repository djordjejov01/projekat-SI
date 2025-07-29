
import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [firstName, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhone] = useState('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`${API_URL}/MobileUser/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setName(data.firstName || '');
          setLastName(data.lastName || '');
          setEmail(data.email || '');
          setPhone(data.phoneNumber || '');
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert(t('personalInfo.error'), t('personalInfo.notLoggedIn'));
        return;
      }

      const res = await fetch(`${API_URL}/MobileUser/profileUpdate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phoneNumber,
        }),
      });

      if (res.ok) {
        Alert.alert(t('personalInfo.success'), t('personalInfo.updated'));
        router.push('../(tabs)/profile');
      } else {
        const err = await res.json();
        throw new Error(err.message || t('personalInfo.updateFailed'));
      }
    } catch (error: any) {
      Alert.alert(t('personalInfo.error'), error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('../(tabs)/profile')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>{t('personalInfo.title')}</Text>
        </View>
      </View>

      <Text style={styles.label}>{t('personalInfo.firstName')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('personalInfo.firstNamePlaceholder')}
        value={firstName}
        onChangeText={setName}
      />

      <Text style={styles.label}>{t('personalInfo.lastName')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('personalInfo.lastNamePlaceholder')}
        value={lastName}
        onChangeText={setLastName}
      />

      <Text style={styles.label}>{t('personalInfo.email')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('personalInfo.emailPlaceholder')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>{t('personalInfo.phone')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('personalInfo.phonePlaceholder')}
        value={phoneNumber}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>{t('personalInfo.saveChanges')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    paddingRight: 10,
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
    marginRight: 34, // balans za centriranje zbog strelice levo
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});


