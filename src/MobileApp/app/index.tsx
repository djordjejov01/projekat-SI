import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState<'en' | 'sr'>('en');

useEffect(() => {
  setSelectedLang(i18n.language === 'sr' ? 'sr' : 'en');
}, []);


const handleLanguageSwitch = async (lang: 'en' | 'sr') => {
  await i18n.changeLanguage(lang);
  await i18n.services.languageDetector.cacheUserLanguage(lang);
  setSelectedLang(lang);
};

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/SyncUpLogo.png')} style={styles.icon} />

      <Text style={styles.subtitle}>Discover the World at Your Fingertips</Text>

      <Link href="/login" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>{t('home.login_signup')}</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/guest" asChild>
        <TouchableOpacity>
          <Text style={styles.guestText}>{t('home.guest_mode')}</Text>
        </TouchableOpacity>
      </Link>

      {/* Jezik ispod Guest mode */}
      <View style={styles.langSwitchContainer}>
        <TouchableOpacity
          onPress={() => handleLanguageSwitch('en')}
          style={[styles.langButton, selectedLang === 'en' && styles.selectedLang]}
        >
          <Text style={[styles.langText, selectedLang === 'en' && styles.selectedText]}>
            English
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleLanguageSwitch('sr')}
          style={[styles.langButton, selectedLang === 'sr' && styles.selectedLang]}
        >
          <Text style={[styles.langText, selectedLang === 'sr' && styles.selectedText]}>
            Srpski
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  icon: {
    width: 250, height: 250, marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#555',
    fontWeight: '500',
    marginVertical: 20,
    fontStyle: 'italic',
    lineHeight: 26,
    maxWidth: 280,
  },
  button: {
    backgroundColor: '#7069E1',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 40,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff', fontWeight: 'bold',
  },
  guestText: {
    color: '#333',
    textDecorationLine: 'underline',
    marginTop: 10,
    marginBottom: 16,
  },
  langSwitchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  langButton: {
    marginTop:50,
    paddingVertical: 8,
    paddingHorizontal: 18,
    backgroundColor: '#EEE',
    borderRadius: 20,
  },
  selectedLang: {
    backgroundColor: '#7069E1',
  },
  langText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedText: {
    color: '#fff',
  },
});
