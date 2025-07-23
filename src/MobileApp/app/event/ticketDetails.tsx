import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { API_URL } from '../../config';

export default function TicketDetails() {
  const params = useLocalSearchParams();
  const { ticketIDs, eventName, ticketType, purchasedAt, price, location } = params;

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
        //console.log("USER DATA", data);

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

      Alert.alert('Saved!', `QR code saved to ${filename}`);
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to save QR code');
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
      Alert.alert('Error', 'Failed to share QR code');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Ticket Details</Text>

      <Text style={styles.eventName}>{eventName}</Text>
      {location && <Text style={styles.detail}>Location: {location}</Text>}
      <Text style={styles.detail}>Ticket Type: {ticketType}</Text>
      <Text style={styles.detail}>Purchased At: {formattedDate}</Text>
      <Text style={styles.detail}>Price: {price} €</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <Text style={styles.detail}>
          Purchased by: <Text style={{ fontWeight: '600' }}>{fullName ?? 'Unknown user'}</Text>
        </Text>
      )}

      <View style={{ marginVertical: 10 }}>
        {ids.length === 0 && <Text>No ticket IDs provided.</Text>}
        {ids.map((id, index) => (
          <View key={index} style={styles.ticketCard}>
            <Text style={styles.ticketLabel}>Ticket #{index + 1}</Text>
            <QRCode
              value={`ticket-${id}-${index}-${purchasedAt}`}
              size={250}
              backgroundColor="white"
            color="black"
              getRef={(ref) => (svgRefs.current[index] = ref)}
            />

            <View style={styles.actions}>
              <TouchableOpacity onPress={() => downloadQR(index)} style={styles.button}>
                <Text style={styles.buttonText}>Download</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => shareQR(index)} style={styles.buttonSecondary}>
                <Text style={styles.buttonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 20},
  eventName: { fontSize: 20, fontWeight: '700', marginBottom: 10 },
  detail: { fontSize: 16, marginBottom: 6 },
  ticketCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    marginTop: 30,
    marginBottom: 56,
    alignItems: 'center',
    elevation: 2,
  
  },
  ticketLabel: { fontSize: 18, fontWeight: '600', marginBottom: 20 },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    backgroundColor: '#7069E1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  buttonSecondary: {
    backgroundColor: '#4B5563',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
