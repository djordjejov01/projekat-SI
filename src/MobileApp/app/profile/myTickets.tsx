import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { API_URL } from '../../config';

type PurchasedTicket = {
  ticketID: number;
  purchasedAt: string;
  ticketType: string;
  eventName: string;
  price: number;
  userTicketID: number;
};

type GroupedTicket = {
  ticketType: string;
  eventName: string;
  price: number;
  quantity: number;
  purchasedAt: string;
  ticketIDs: number[]; // korisno za QR kodove
};

export default function ProfileTickets() {
  const [groupedTickets, setGroupedTickets] = useState<GroupedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTickets = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/ticket/tickets/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data: PurchasedTicket[] = await res.json();

          // Grupisanje po eventName + ticketType
          const grouped: { [key: string]: GroupedTicket } = {};

          data.forEach((ticket) => {
            const key = `${ticket.eventName}_${ticket.ticketType}`;
            if (!grouped[key]) {
              grouped[key] = {
                ticketType: ticket.ticketType,
                eventName: ticket.eventName,
                price: ticket.price,
                quantity: 1,
                purchasedAt: ticket.purchasedAt,
                ticketIDs: [ticket.ticketID],
              };
            } else {
              grouped[key].quantity += 1;
              grouped[key].ticketIDs.push(ticket.ticketID);
            }
          });

          setGroupedTickets(Object.values(grouped));
        } else {
          console.warn('Failed to fetch tickets');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const renderItem = ({ item }: { item: GroupedTicket }) => (
    <TouchableOpacity
      style={styles.ticketItem}
onPress={() => 
  router.push({
    pathname: '../event/ticketDetails',
    params: {
      ticketIDs: JSON.stringify(item.ticketIDs),
      eventName: item.eventName,
      ticketType: item.ticketType,
      purchasedAt: item.purchasedAt,
      price: item.price.toString(),
    },
  })
}

    >
      <Text style={styles.title}>{item.eventName}</Text>
      <Text style={styles.details}>Ticket Type: {item.ticketType}</Text>
      <Text style={styles.details}>Quantity: {item.quantity}</Text>
      <Text style={styles.details}>Price: {item.price} €</Text>
      <Text style={styles.details}>
        Purchased on: {new Date(item.purchasedAt).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7069E1" />
      </View>
    );
  }

  if (groupedTickets.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Trenutno nemate nijednu kupljenu kartu.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.header}>My Tickets</Text>
      <FlatList
        data={groupedTickets}
        keyExtractor={(item, index) =>
          item.ticketIDs.length > 0
            ? item.ticketIDs.join('-')
            : `${item.eventName}-${item.ticketType}-${index}`
        }
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 24, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 20, marginBottom: 10, color: '#333' },
  ticketItem: { backgroundColor: '#f3f4f6', padding: 16, borderRadius: 12, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  details: { fontSize: 14, color: '#555' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  emptyText: { fontSize: 16, color: '#888', textAlign: 'center' },
});
