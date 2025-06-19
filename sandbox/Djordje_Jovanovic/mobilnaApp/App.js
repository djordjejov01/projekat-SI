import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import config from './config';

export default function App() {
  const [users, setUsers] = useState([]);

  // Polja za unos / izmenu
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');

  
  const [editingUserId, setEditingUserId] = useState(null);

  const apiBaseUrl = config.apiBaseUrl;

  
  const fetchUsers = async () => {
    try {
      const res = await fetch(apiBaseUrl);
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Greška prilikom dobavljanja korisnika:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Dodavanje ili izmena korisnika
  const saveUser = async () => {
    if (!email || !mobile || !city || !state || !address) {
      Alert.alert('Greška', 'Popunite sva polja!');
      return;
    }

    const userData = { email, mobile, city, state, address };

    try {
      let response;
      if (editingUserId) {
        // Update postojećeg korisnika
        response = await fetch(`${apiBaseUrl}/${editingUserId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });
      } else {
        // Dodavanje novog korisnika
        response = await fetch(apiBaseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });
      }

      if (response.ok) {
        fetchUsers();
        clearForm();
      } else {
        const text = await response.text();
        Alert.alert('Greška', `Neuspešno čuvanje: ${text}`);
      }
    } catch (error) {
      Alert.alert('Greška', `Greška prilikom čuvanja: ${error.message}`);
    }
  };

  // Brisanje korisnika
  const deleteUser = async (userId) => {
    try {
      const response = await fetch(`${apiBaseUrl}/${userId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchUsers();
      } else {
        const text = await response.text();
        Alert.alert('Greška', `Neuspešno brisanje: ${text}`);
      }
    } catch (error) {
      Alert.alert('Greška', `Greška prilikom brisanja: ${error.message}`);
    }
  };

  // Postavljanje korisnika u formu za izmenu
  const startEditing = (user) => {
    setEditingUserId(user.userId);
    setEmail(user.email);
    setMobile(user.mobile);
    setCity(user.city);
    setState(user.state);
    setAddress(user.address);
  };

  // Čišćenje forme
  const clearForm = () => {
    setEditingUserId(null);
    setEmail('');
    setMobile('');
    setCity('');
    setState('');
    setAddress('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Korisnici</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Broj telefona"
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Grad"
        value={city}
        onChangeText={setCity}
      />
      <TextInput
        style={styles.input}
        placeholder="Država"
        value={state}
        onChangeText={setState}
      />
      <TextInput
        style={styles.input}
        placeholder="Adresa"
        value={address}
        onChangeText={setAddress}
      />

      <Button
        title={editingUserId ? 'Sačuvaj izmene' : 'Dodaj korisnika'}
        onPress={saveUser}
      />
      {editingUserId && (
        <Button
          title="Otkaži izmenu"
          color="gray"
          onPress={clearForm}
        />
      )}

      <FlatList
        data={users}
        keyExtractor={(item) => item.userId.toString()}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Text style={{ fontWeight: 'bold' }}>{item.email}</Text>
            <Text>{item.mobile}</Text>
            <Text>{item.city}, {item.state}</Text>
            <Text>{item.address}</Text>

            <View style={styles.buttonsRow}>
              <Button title="Izmeni" onPress={() => startEditing(item)} />
              <Button
                title="Obriši"
                color="red"
                onPress={() =>
                  Alert.alert(
                    'Potvrda',
                    'Da li ste sigurni da želite da obrišete korisnika?',
                    [
                      { text: 'Ne', style: 'cancel' },
                      { text: 'Da', onPress: () => deleteUser(item.userId) },
                    ]
                  )
                }
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 40, flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1,
    padding: 8,
    marginVertical: 5,
    borderRadius: 5,
  },
  userCard: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});
