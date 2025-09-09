import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_URL } from '../../config';
import { useTranslation } from 'react-i18next';
import { apiCall } from '../../config';
import { Ionicons } from '@expo/vector-icons';

type Ticket = {
  UserTicketID: number;
  TicketID: number;
  TicketType: string;
  ValidationToken: string;
  PurchasedAt: string;
};

type ResourceReservation = {
  ReservationID: number;
  ResourceName: string;
  Quantity: number;
  ReservedAt: string;
  UserTicketID: number | null;
  EventTitle: string;
  EventID: number;
};

export default function ReservationDetails() {
  const { t } = useTranslation();
  const router = useRouter();
  const { eventID } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [eventTitle, setEventTitle] = useState('');
  const [reservations, setReservations] = useState<ResourceReservation[]>([]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Fetch svih rezervacija i filtriranje na frontendu
        const res = await apiCall(`${API_URL}/api/Resource/my-reservations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) {
          console.error('Failed to fetch reservations');
          setLoading(false);
          return;
        }

        const data = await res.json();
        const eventReservations = data.filter((r: any) => r.eventID == eventID);
        
        if (eventReservations.length === 0) {
          setLoading(false);
          return;
        }

        setEventTitle(eventReservations[0].eventTitle);

        // Grupisanje i obrada podataka za prikaz
        const reservationsForDisplay = eventReservations.map((r: any) => ({
          ReservationID: r.reservationID,
          ResourceName: r.resourceName,
          Quantity: r.quantity,
          ReservedAt: r.reservedAt,
          UserTicketID: r.userTicketID,
          EventTitle: r.eventTitle,
          EventID: r.eventID,
        }));
        
        setReservations(reservationsForDisplay);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [eventID]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0047FF" />
        <Text style={{ marginTop: 10 }}>{t('loading')}</Text>
      </View>
    );
  }
  
  if (reservations.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.eventTitle}>{eventTitle}</Text>
        <Text style={styles.noReservationsText}>{t('reservationDetails.noReservations')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="black" />
      </TouchableOpacity>
      <Text style={styles.eventTitle}>{eventTitle}</Text>

      <ScrollView>
        {reservations.map((res, idx) => (
          <View key={res.ReservationID} style={styles.resourceCard}>
            <Text style={styles.resourceName}>{res.ResourceName}</Text>
            <Text style={styles.detailText}>{t('reservationDetails.quantity')}: {res.Quantity}</Text>
            <Text style={styles.detailText}>{t('reservationDetails.reservedAt')}: {new Date(res.ReservedAt).toLocaleString()}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, backgroundColor: '#fff' },
  backButton: { marginBottom: 15 },
  eventTitle: { fontSize: 24, fontWeight: '700', color: '#3478f6', marginBottom: 20 },
  noReservationsText: { fontSize: 18, textAlign: 'center', marginTop: 50, color: '#95a5a6' },
  resourceCard: { backgroundColor: '#fafafa', borderRadius: 12, padding: 20, marginBottom: 20 },
  resourceName: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  detailText: { fontSize: 16, marginBottom: 6 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
