import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config';

type Ticket = {
  id: number;
  name: string;
  price: number;
};

type Resource = {
  id: number;
  name: string;
  price?: number;
};

export default function CartScreen() {
  const router = useRouter();
  const { tickets, resources } = useLocalSearchParams();
  const [selectedTickets, setSelectedTickets] = useState<{ id: number; quantity: number }[]>([]);
  const [ticketData, setTicketData] = useState<Ticket[]>([]);
  const [resourceData, setResourceData] = useState<Resource[]>([]);
  const [selectedResources, setSelectedResources] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
    };

    fetchToken();
  }, []);

  useEffect(() => {
    const parsedTickets = tickets ? JSON.parse(tickets as string) : {};
    const parsedResources = resources ? JSON.parse(resources as string) : [];

    const ticketArray = Object.entries(parsedTickets).map(([id, quantity]) => ({
      id: Number(id),
      quantity: Number(quantity),
    }));

    setSelectedTickets(ticketArray);
    setSelectedResources(parsedResources);
  }, [tickets, resources]);

  useEffect(() => {
    const fetchTicketsAndResources = async () => {
      try {
        const ticketRes = await fetch(`${API_URL}/Ticket/events/1/tickets`);
        const ticketsJson = await ticketRes.json();
        setTicketData(ticketsJson);

        const resourceRes = await fetch(`${API_URL}/Resource/1/resources`);
        const resourcesJson = await resourceRes.json();
        setResourceData(resourcesJson);
      } catch (error) {
        Alert.alert('Greška', 'Neuspešno učitavanje podataka.');
      }
    };

    fetchTicketsAndResources();
  }, []);

  const getTicketInfo = (id: number) => ticketData.find((t) => t.id === id);
  const getResourceInfo = (id: number) => resourceData.find((r) => r.id === id);

  const calculateTotal = () => {
    let total = 0;

    selectedTickets.forEach((t) => {
      const info = getTicketInfo(t.id);
      if (info) total += info.price * t.quantity;
    });

    selectedResources.forEach((resId) => {
      const info = getResourceInfo(resId);
      if (info?.price) total += info.price;
    });

    return total;
  };

  const handlePurchase = async () => {
    Alert.alert(
      'Potvrda kupovine',
      'Da li ste sigurni da želite da obavite kupovinu?',
      [
        { text: 'Otkaži', style: 'cancel' },
        {
          text: 'Kupi',
          onPress: async () => {
            setLoading(true);
            try {
              // 1. Pripremi telo za ticket purchase
              const ticketRequestBody = selectedTickets.flatMap((ticket) =>
                Array(ticket.quantity).fill({ ticketID: ticket.id })
              );

              const purchaseResponse = await fetch(`${API_URL}/Ticket/purchase`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(ticketRequestBody),
              });

              if (!purchaseResponse.ok) throw new Error('Kupovina ulaznica nije uspela.');

              const userTicketIDs: number[] = await purchaseResponse.json();

              // 2. Pripremi telo za resource reserve (ako ima resursa)
              if (selectedResources.length > 0 && userTicketIDs.length > 0) {
                const resourceRequestBody = selectedResources.map((resId, index) => ({
                  eventResourceID: resId,
                  quantity: 1,
                  userTicketID: userTicketIDs[index % userTicketIDs.length],
                }));

                const reserveResponse = await fetch(`${API_URL}//Resource/reserve`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify(resourceRequestBody),
                });

                if (!reserveResponse.ok) throw new Error('Rezervacija resursa nije uspela.');
              }

              setTimeout(() => {
                setLoading(false);
                Alert.alert(
                  'Uspešna kupovina',
                  'Kartu možete pronaći u Profile tabu, u listi kupljenih karata.'
                );
                router.replace('/(tabs)/events');
              }, 1500);
            } catch (error: any) {
              setLoading(false);
              Alert.alert('Greška', error.message || 'Greška prilikom kupovine.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Vaša korpa</Text>

      <Text style={styles.sectionTitle}>Ulaznice</Text>
      {selectedTickets.map((ticket) => {
        const info = getTicketInfo(ticket.id);
        if (!info) return null;

        return (
          <View key={ticket.id} style={styles.itemRow}>
            <Text style={styles.itemText}>
              {info.name} x {ticket.quantity}
            </Text>
            <Text style={styles.itemPrice}>{info.price * ticket.quantity} RSD</Text>
          </View>
        );
      })}

      <Text style={styles.sectionTitle}>Resursi</Text>
      {selectedResources.map((resId) => {
        const res = getResourceInfo(resId);
        if (!res) return null;

        return (
          <View key={resId} style={styles.itemRow}>
            <Text style={styles.itemText}>{res.name}</Text>
            <Text style={styles.itemPrice}>{res.price ? `${res.price} RSD` : 'Besplatno'}</Text>
          </View>
        );
      })}

      <View style={styles.totalRow}>
        <Text style={styles.totalText}>Ukupno:</Text>
        <Text style={styles.totalText}>{calculateTotal()} RSD</Text>
      </View>

      <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase} disabled={loading}>
        <Text style={styles.purchaseText}>Kupi</Text>
      </TouchableOpacity>

      {loading && (
        <View style={{ marginTop: 20 }}>
          <ActivityIndicator size="large" color="#0047FF" />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 10,
    color: '#444',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  itemPrice: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 12,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  purchaseButton: {
    backgroundColor: '#0047FF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  purchaseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
