import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { API_URL } from '../../config';
import { useTranslation } from 'react-i18next';

export default function TicketDetails() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  // console.log(params)

  const { ticketIDs, eventName, eventID, purchasedAt, price} = params;

  const router = useRouter();

  const [fullName, setFullName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const svgRefs = useRef<Array<any>>([]);

  let ids: number[] = [];
  try {
    if (ticketIDs) {
      ids = JSON.parse(ticketIDs as string);
    }
  } catch (error) {
    console.error('Invalid ticketIDs param', error);
  }

  const formattedDate = purchasedAt
    ? new Date(purchasedAt as string).toLocaleString()
    : '';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`${API_URL}/MobileUser/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();
        setFullName(`${data.firstName} ${data.lastName}`);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const downloadQR = async (index: number) => {
    try {
      const ref = svgRefs.current[index];
      if (!ref) return;

      const svgData = await new Promise<string>((resolve) =>
        ref.toDataURL((data: string) => resolve(data))
      );

      const filename = FileSystem.documentDirectory + `ticket-${index + 1}.png`;
      await FileSystem.writeAsStringAsync(filename, svgData, {
        encoding: FileSystem.EncodingType.Base64,
      });

      Alert.alert(t('qr.savedTitle'), t('qr.savedMessage', { filename }));
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert(t('qr.errorTitle'), t('qr.saveError'));
    }
  };

  const shareQR = async (index: number) => {
    try {
      const ref = svgRefs.current[index];
      if (!ref) return;

      const svgData = await new Promise<string>((resolve) =>
        ref.toDataURL((data: string) => resolve(data))
      );

      const fileUri = FileSystem.cacheDirectory + `ticket-${index + 1}.png`;
      await FileSystem.writeAsStringAsync(fileUri, svgData, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert(t('qr.errorTitle'), t('qr.shareError'));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>🎟️ {t('ticketDetails.title')}</Text>
<TouchableOpacity onPress={() => router.push(`/event/${eventID}`)
}>
  
  <Text style={styles.eventTitleLink}>{eventName}</Text>
</TouchableOpacity>


      {/* <Text style={styles.eventInfo}>{location}</Text>
      <Text style={styles.eventInfo}>
        {eventDateTime ? new Date(eventDateTime as string).toLocaleString() : ''}
      </Text> */}

      <Text style={styles.detail}>{t('ticketDetails.purchasedAt')}: {formattedDate}</Text>
      <Text style={styles.detail}>{t('ticketDetails.price')}: {price} €</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <Text style={styles.detail}>
          {t('ticketDetails.purchasedBy')}:{' '}
          <Text style={{ fontWeight: '600' }}>
            {fullName ?? t('ticketDetails.unknownUser')}
          </Text>
        </Text>
      )}

      <View style={{ marginVertical: 10 }}>
        {ids.length === 0 && <Text>{t('ticketDetails.noTickets')}</Text>}
        {ids.map((id, index) => (
          <View key={index} style={styles.ticketCard}>
            <Text style={styles.ticketLabel}>🎫 {t('ticketDetails.ticket')} #{index + 1}</Text>
            <QRCode
              value={`user-ticket-${id}`}
              size={250}
              backgroundColor="white"
              color="black"
              getRef={(ref) => (svgRefs.current[index] = ref)}
            />

            <View style={styles.cardDetails}>
              <Text style={styles.detail}>{t('ticketDetails.purchasedAt')}: {formattedDate}</Text>
              <Text style={styles.detail}>{t('ticketDetails.price')}: {price} €</Text>
              {!loading && (
                <Text style={styles.detail}>
                  {t('ticketDetails.purchasedBy')}: <Text style={{ fontWeight: '600' }}>{fullName ?? t('ticketDetails.unknownUser')}</Text>
                </Text>
              )}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity onPress={() => downloadQR(index)} style={styles.button}>
                <Text style={styles.buttonText}>📥 {t('buttons.download')}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => shareQR(index)} style={styles.buttonSecondary}>
                <Text style={styles.buttonText}>📤 {t('buttons.share')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={styles.backToEventsButton}
        onPress={() => router.replace('/(tabs)/events')}
      >
        <Text style={styles.backToEventsText}>{t('buttons.backToEvents')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 16,  // smanjeno sa 24 na 16
    textAlign: 'center',
    color: '#1e1e1e',
  },
  eventTitleLink: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3478f6',
    textAlign: 'center',
    marginBottom: 6, // smanjeno sa 8 na 6
    textDecorationLine: 'underline',
  },
  eventInfo: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4, // smanjeno sa 8 na 4
    fontWeight: '500',
  },
  // ostalo ostaje isto
  ticketCard: {
    backgroundColor: '#fafafa',
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 28,
    marginTop: 28,
    marginBottom: 36,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    alignItems: 'center',
  },
  ticketLabel: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 22,
    color: '#333',
    textAlign: 'center',
    width: '100%',
  },
  cardDetails: {
    marginTop: 14,
    alignSelf: 'stretch',
    width: '100%',
    paddingLeft: 8,
  },
  detail: {
    fontSize: 16,
    marginBottom: 6,
    textAlign: 'left',
    color: '#444',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 22,
    justifyContent: 'center',
    gap: 18,
  },
  button: {
    backgroundColor: '#5C5EE0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 5,
    shadowColor: '#5c5ee0',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  buttonSecondary: {
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  backToEventsButton: {
    backgroundColor: '#1A56DB',
    paddingVertical: 16,
    paddingHorizontal: 26,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 12,
    shadowColor: '#1a56db',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  backToEventsText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});
