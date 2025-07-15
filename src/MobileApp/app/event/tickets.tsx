import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_URL } from '../../config';

type Ticket = {
  id: number;
  name: string;
  price: number;
  available: number;
};

type Resource = {
  id: number;
  name: string;
  price?: number;
};

export default function TicketPurchaseScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [selectedResources, setSelectedResources] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsRes, resourcesRes] = await Promise.all([
          fetch(`${API_URL}/Ticket/events/${eventId}/tickets`),
          fetch(`${API_URL}/Resource/${eventId}/resources`),
        ]);
        
        const ticketData = ticketsRes.ok && ticketsRes.status !== 204 ? await ticketsRes.json() : [];
        const resourceData = resourcesRes.ok && resourcesRes.status !== 204 ? await resourcesRes.json() : [];
        
        
        setTickets(ticketData);
        setResources(resourceData);
      } catch (error) {
        console.log(eventId);
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const handleAddToCart = (ticketId: number) => {
    setCart((prev) => ({
      ...prev,
      [ticketId]: (prev[ticketId] || 0) + 1,
    }));
  };

  const handleRemoveFromCart = (ticketId: number) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[ticketId] > 0) updated[ticketId] -= 1;
      if (updated[ticketId] === 0) delete updated[ticketId];
      return updated;
    });
  };

  const toggleResource = (resId: number) => {
    setSelectedResources((prev) => {
      const updated = new Set(prev);
      updated.has(resId) ? updated.delete(resId) : updated.add(resId);
      return updated;
    });
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 100 }} size="large" color="#0047FF" />;
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.cartIcon} onPress={() => router.push({
        pathname: './cart',
        params: {
          eventId: eventId?.toString(),
          tickets: JSON.stringify(cart),
          resources: JSON.stringify(Array.from(selectedResources)),
        },
      })}>
        <Ionicons name="cart-outline" size={28} />
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Tickets</Text>
      {tickets.map((ticket) => (
        <View key={ticket.id} style={styles.itemRow}>
          <Text style={styles.itemText}>
            {ticket.name} - {ticket.price} RSD ({ticket.available} left)
          </Text>
          <View style={styles.counterRow}>
            <TouchableOpacity onPress={() => handleRemoveFromCart(ticket.id)}>
              <Text style={styles.counterButton}>-</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{cart[ticket.id] || 0}</Text>
            <TouchableOpacity onPress={() => handleAddToCart(ticket.id)}>
              <Text style={styles.counterButton}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Reservation Resources</Text>
      {resources.map((res) => (
        <TouchableOpacity key={res.id} style={styles.checkboxRow} onPress={() => toggleResource(res.id)}>
          <Ionicons
            name={selectedResources.has(res.id) ? 'checkbox' : 'square-outline'}
            size={24}
            color="#0047FF"
          />
          <Text style={styles.itemText}>
            {res.name} {res.price ? `- ${res.price} RSD` : ''}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.proceedButton}
        onPress={() => {
          router.push({
            pathname: './cart',
            params: {
              eventId: eventId?.toString(),
              tickets: JSON.stringify(cart),
              resources: JSON.stringify(Array.from(selectedResources)),
            },
          });
        }}
      >
        <Text style={styles.proceedText}>Go to Cart</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  cartIcon: { alignSelf: 'flex-end', marginBottom: 10 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 14 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  itemText: { fontSize: 16, flex: 1 },
  counterRow: { flexDirection: 'row', alignItems: 'center' },
  counterButton: {
    fontSize: 20,
    width: 32,
    height: 32,
    textAlign: 'center',
    backgroundColor: '#ddd',
    marginHorizontal: 5,
    borderRadius: 5,
  },
  counterValue: { fontSize: 16, minWidth: 20, textAlign: 'center' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  proceedButton: {
    marginTop: 20,
    backgroundColor: '#0047FF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  proceedText: { color: 'white', fontWeight: '600', fontSize: 16 },
});
