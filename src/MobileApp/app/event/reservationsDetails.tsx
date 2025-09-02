import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_URL } from '../../config';
import { useTranslation } from 'react-i18next';

type Ticket = {
  id: number;
  token: string;
  typeName: string;
};

type ResourceReservation = {
  ResourceName: string;
  Quantity: number;
  ReservedAt: string;
  Tickets: Ticket[];
};

export default function ReservationDetails() {
  const { t } = useTranslation();
  const router = useRouter();
  const { eventID } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [eventTitle, setEventTitle] = useState('');
  const [resources, setResources] = useState<ResourceReservation[]>([]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`${API_URL}/api/Resource/my-reservations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        const eventData = data.filter((r: any) => r.EventID == eventID);
        if (!eventData.length) return;

        setEventTitle(eventData[0].EventTitle);

        // Grupisanje po resursima
        const grouped: Record<string, ResourceReservation> = {};
        eventData.forEach((r: any) => {
          if (!grouped[r.ResourceName]) {
            grouped[r.ResourceName] = {
              ResourceName: r.ResourceName,
              Quantity: r.Quantity,
              ReservedAt: r.ReservedAt,
              Tickets: r.UserTickets ?? [],
            };
          } else {
            grouped[r.ResourceName].Quantity += r.Quantity;
            grouped[r.ResourceName].Tickets.push(...(r.UserTickets ?? []));
          }
        });

        setResources(Object.values(grouped));
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

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.push(`../event/${eventID}`)}>
        <Text style={styles.eventTitle}>{eventTitle}</Text>
      </TouchableOpacity>

      {resources.map((res, idx) => (
        <View key={idx} style={styles.resourceCard}>
          <Text style={styles.resourceName}>{res.ResourceName}</Text>
          <Text style={styles.detailText}>{t('reservationDetails.quantity')}: {res.Quantity}</Text>
          <Text style={styles.detailText}>{t('reservationDetails.reservedAt')}: {new Date(res.ReservedAt).toLocaleString()}</Text>

          {res.Tickets && res.Tickets.length > 0 && (
            <View style={styles.ticketsSection}>
              <Text style={styles.ticketsHeader}>Karte:</Text>
              {res.Tickets.map((ticket, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => router.push({
                    pathname: '../tickets/ticketDetails',
                    params: {
                      ticketIDs: JSON.stringify([ticket.id]),
                      validationTokens: JSON.stringify([ticket.token]),
                      eventID: eventID,
                      eventName: eventTitle,
                      from: 'reservationDetails',
                    }
                  })}
                >
                  <Text style={styles.ticketLink}>→ {ticket.typeName}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>{t('buttons.backToMyReservations')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, backgroundColor: '#fff' },
  eventTitle: { fontSize: 24, fontWeight: '700', color: '#3478f6', marginBottom: 20 },
  resourceCard: { backgroundColor: '#fafafa', borderRadius: 12, padding: 20, marginBottom: 20 },
  resourceName: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  detailText: { fontSize: 16, marginBottom: 6 },
  ticketsSection: { marginTop: 10 },
  ticketsHeader: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  ticketLink: { fontSize: 16, color: '#1A56DB', marginBottom: 4 },
  backButton: { backgroundColor: '#1A56DB', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  backButtonText: { color: 'white', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
