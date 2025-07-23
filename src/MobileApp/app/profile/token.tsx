import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
import { useRouter } from 'expo-router';
import { API_URL } from '../../config';

export default function TokenPurchaseScreen() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const handlePurchase = async () => {
    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Greška', 'Unesite validan broj tokena.');
      return;
    }

    try {
      setProcessing(true);
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulacija animacije

      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/User/Credit/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: parsedAmount }),
      });

      if (response.ok) {
        Alert.alert('Uspešno', `Dodata su ${parsedAmount} tokena na tvoj račun.`);
        setAmount('');
      } else {
        Alert.alert('Greška', 'Došlo je do greške prilikom uplate.');
      }
    } catch (error) {
      Alert.alert('Greška', 'Greška prilikom povezivanja sa serverom.');
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>Uplata tokena</Text>

      <Text style={styles.label}>Unesite broj tokena:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        placeholder="npr. 10"
      />

      {processing && (
        <Animatable.View
          animation="pulse"
          easing="ease-in-out"
          iterationCount="infinite"
          style={styles.cardAnimation}
        >
          <Ionicons name="card-outline" size={60} color="#0066cc" />
          <Text style={styles.processingText}>Obrada uplate...</Text>
        </Animatable.View>
      )}

      <TouchableOpacity style={styles.btn} onPress={handlePurchase} disabled={loading || processing}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Simuliraj uplatu</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#1e1e1e',
  },
  label: {
    fontSize: 18,
    color: '#444',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 18,
    backgroundColor: '#fff',
  },
  btn: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  cardAnimation: {
    alignItems: 'center',
    marginVertical: 20,
  },
  processingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});
