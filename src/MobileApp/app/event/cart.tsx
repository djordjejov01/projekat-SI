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
import { Ionicons } from '@expo/vector-icons';

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

type UserTicket = {
  id: number;
  ticketID: number;
};

export default function CartScreen() {
  const router = useRouter();
  const { tickets, resources, eventId } = useLocalSearchParams();

  const [selectedTickets, setSelectedTickets] = useState<{ id: number; quantity: number }[]>([]);
  const [selectedResources, setSelectedResources] = useState<number[]>([]);
  const [ticketData, setTicketData] = useState<Ticket[]>([]);
  const [resourceData, setResourceData] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('token').then(setToken);
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
    if (!eventId) return;

    const fetchTicketsAndResources = async () => {
      try {
        const ticketRes = await fetch(`${API_URL}/Ticket/events/${eventId}/tickets`);
        const ticketsJson = ticketRes.ok ? await ticketRes.json() : [];

        const resourceRes = await fetch(`${API_URL}/Resource/${eventId}/resources`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const resourcesJson = resourceRes.ok ? await resourceRes.json() : [];

        const mappedTickets = ticketsJson.map((t: any) => ({
          id: t.ticketID,
          name: t.typeName,
          price: t.price,
        }));

        const mappedResources = resourcesJson.map((r: any) => ({
          id: r.id,
          name: r.name,
          price: r.price,
        }));

        setTicketData(mappedTickets);
        setResourceData(mappedResources);
      } catch {
        Alert.alert('Greška', 'Neuspešno učitavanje podataka.');
      }
    };

    fetchTicketsAndResources();
  }, [eventId, token]);

  const getTicketInfo = (id: number) => ticketData.find(t => t.id === id);
  const getResourceInfo = (id: number) => resourceData.find(r => r.id === id);

  const calculateTotal = () => {
    let total = 0;
    selectedTickets.forEach(t => {
      const info = getTicketInfo(t.id);
      if (info) total += info.price * t.quantity;
    });
    selectedResources.forEach(resId => {
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
              if (!token) {
                Alert.alert('Greška', 'Morate biti prijavljeni da biste kupili karte.');
                setLoading(false);
                return;
              }

              const ticketRequestBody = selectedTickets.flatMap(ticket =>
                Array(ticket.quantity).fill({ TicketID: ticket.id })
              );
              console.log('Ticket request:', ticketRequestBody);
              const purchaseRes = await fetch(`${API_URL}/Ticket/purchase`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ dto: ticketRequestBody }),
            });


                      if (!purchaseRes.ok) {
          const errorText = await purchaseRes.text();
          console.error('Purchase failed:', errorText);
          throw new Error(`Kupovina ulaznica nije uspela. ${errorText}`);
                                              }


              // Dohvati sve korisničke karte nakon kupovine
              const allUserTicketsRes = await fetch(`${API_URL}/Ticket/tickets/my`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const allUserTickets: UserTicket[] = await allUserTicketsRes.json();

              // Pronađi novokupljene karte koje odgovaraju onima u selectedTickets
              const newUserTicketIDs = allUserTickets
                .filter(ut =>
                  selectedTickets.some(st =>
                    st.id === ut.ticketID
                  )
                )
                .map(ut => ut.id);

              // Rezerviši svaki izabrani resurs za svaku novu kartu
              for (const resId of selectedResources) {
                for (const userTicketID of newUserTicketIDs) {
                  await fetch(`${API_URL}/Resource/reserve`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      eventResourceID: resId,
                      quantity: 1,
                      userTicketID: userTicketID,
                    }),
                  });
                }
              }

              setLoading(false);
              Alert.alert('Uspešno', 'Karte i resursi su uspešno kupljeni.', [
                { text: 'OK', onPress: () => router.replace('/(tabs)/events') },
              ]);
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
      <TouchableOpacity onPress={() => router.back()} style={styles.backArrow}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>Vaša korpa</Text>

      <Text style={styles.sectionTitle}>Ulaznice</Text>
      {selectedTickets.length === 0 && <Text>Niste izabrali nijednu kartu.</Text>}
      {selectedTickets.map(ticket => {
        const info = getTicketInfo(ticket.id);
        if (!info) return null;
        return (
          <View key={`ticket-${ticket.id}`} style={styles.itemRow}>
            <Text style={styles.itemText}>{info.name} x {ticket.quantity}</Text>
            <Text style={styles.itemPrice}>{info.price * ticket.quantity} RSD</Text>
          </View>
        );
      })}

      <Text style={styles.sectionTitle}>Resursi</Text>
      {selectedResources.length === 0 && <Text>Niste izabrali dodatne resurse.</Text>}
      {selectedResources.map(resId => {
        const res = getResourceInfo(resId);
        if (!res) return null;
        return (
          <View key={`res-${resId}`} style={styles.itemRow}>
            <Text style={styles.itemText}>{res.name}</Text>
            <Text style={styles.itemPrice}>{res.price ? `${res.price} RSD` : 'Besplatno'}</Text>
          </View>
        );
      })}

      <View style={styles.totalRow}>
        <Text style={styles.totalText}>Ukupno:</Text>
        <Text style={styles.totalText}>{calculateTotal()} RSD</Text>
      </View>

      <TouchableOpacity
        style={styles.purchaseButton}
        onPress={handlePurchase}
        disabled={loading || selectedTickets.length === 0}
      >
        <Text style={styles.purchaseText}>{loading ? 'Kupovina...' : 'Kupi'}</Text>
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
    marginTop: 30,
  },
  backArrow: {
    position: 'absolute',
    top: 20,
    left: 10,
    zIndex: 10,
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
