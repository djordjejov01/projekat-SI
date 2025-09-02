import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { API_URL } from '../../config';
import { useTranslation } from 'react-i18next';

type Reservation = {
  EventID: number;
  EventTitle: string;
  EventDate: string;
  EventLocation: string;
  EventEndDate: string;
  IsEventFree: boolean;
  Resources: {
    Name: string;
    Quantity: number;
  }[];
};

export default function MyReservations() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('Token:', token);

        if (!token) return;

      const res = await fetch(`${API_URL}/api/Resource/my-reservations`, {
  headers: { Authorization: `Bearer ${token}` },
});

const text = await res.text();
console.log('HTTP status:', res.status);
console.log('Response body:', text);

if (!res.ok) {
  console.error('Fetch failed:', res.status);
  return;
}

const data = JSON.parse(text); // parsiraj samo ako je OK


        // Grupisanje po eventu
        const grouped: Record<number, Reservation> = {};
        data.forEach((r: any) => {
          if (!grouped[r.EventID]) {
            grouped[r.EventID] = {
              EventID: r.EventID,
              EventTitle: r.EventTitle,
              EventDate: r.EventDate,
              EventLocation: r.EventLocation,
              EventEndDate: r.EventEndDate,
              IsEventFree: r.IsEventFree,
              Resources: [],
            };
          }
          grouped[r.EventID].Resources.push({
            Name: r.ResourceName,
            Quantity: r.Quantity,
          });
        });

        setReservations(Object.values(grouped));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0047FF" />
        <Text style={{ marginTop: 10 }}>{t('loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{t('myReservations.title')}</Text>

      {reservations.map((event, index) => {
        const resourceNames = event.Resources.map(r => r.Name).join(', ');
        const totalQuantity = event.Resources.reduce((sum, r) => sum + r.Quantity, 0);

        return (
          <TouchableOpacity
            key={index}
            style={styles.eventCard}
            onPress={() =>
              router.push({
                pathname: `./reservationDetails`,
                params: { eventID: event.EventID },
              })
            }
          >
            <Text style={styles.eventTitle}>{event.EventTitle}</Text>
            <Text style={styles.resourceText}>{t('myReservations.resources')}: {resourceNames}</Text>
            <Text style={styles.quantityText}>{t('myReservations.quantity')}: {totalQuantity}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  eventCard: { backgroundColor: '#f4f4f4', borderRadius: 12, padding: 20, marginBottom: 16 },
  eventTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, color: '#3478f6' },
  resourceText: { fontSize: 16, marginBottom: 4, color: '#333' },
  quantityText: { fontSize: 16, fontWeight: '600', color: '#555' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
