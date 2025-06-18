import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';

interface Proizvod {
  id: number;
  naziv: string;
  cena: number;
}

export default function App() {
  const [proizvodi, setProizvodi] = useState<Proizvod[]>([]);
  const [naziv, setNaziv] = useState('');
  const [cena, setCena] = useState('');
  const [editId, setEditId] = useState<number | null>(null); // za izmenu

  const fetchProizvodi = () => {
    fetch('http://192.168.235.32:5222/api/proizvodi')
      .then(res => res.json())
      .then(data => setProizvodi(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchProizvodi();
  }, []);

  const dodajIliIzmeni = () => {
    if (!naziv || !cena) return;

    if (editId === null) {
      // Dodavanje
      fetch('http://192.168.235.32:5222/api/proizvodi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ naziv, cena: parseFloat(cena) }),
      })
        .then(res => {
          if (!res.ok) throw new Error('Neuspešno dodavanje');
          return res.json();
        })
        .then(() => {
          setNaziv('');
          setCena('');
          fetchProizvodi();
        })
        .catch(console.error);
    } else {
      // Izmena
      fetch(`http://192.168.235.32:5222/api/proizvodi/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, naziv, cena: parseFloat(cena) }),
      })
        .then(res => {
          if (!res.ok) throw new Error('Neuspešna izmena');
          setEditId(null);
          setNaziv('');
          setCena('');
          fetchProizvodi();
        })
        .catch(console.error);
    }
  };

  const obrisiProizvod = (id: number) => {
    Alert.alert(
      "Brisanje proizvoda",
      "Da li ste sigurni da želite da obrišete ovaj proizvod?",
      [
        { text: "Otkaži", style: "cancel" },
        {
          text: "Obriši",
          style: "destructive",
          onPress: () => {
            fetch(`http://192.168.235.32:5222/api/proizvodi/${id}`, {
              method: 'DELETE',
            })
              .then(res => {
                if (!res.ok) throw new Error('Neuspešno brisanje');
                fetchProizvodi();
              })
              .catch(console.error);
          }
        }
      ]
    );
  };

  const pripremiIzmenu = (proizvod: Proizvod) => {
    setNaziv(proizvod.naziv);
    setCena(proizvod.cena.toString());
    setEditId(proizvod.id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista proizvoda</Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Br.</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 4 }]}>Naziv</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 2 }]}>Cena (RSD)</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 3 }]}>Akcija</Text>
      </View>

      <FlatList
        data={proizvodi}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item, index }) => (
          <View style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
            <Text style={[styles.cell, { flex: 1 }]}>{index + 1}</Text>
            <Text style={[styles.cell, { flex: 4 }]}>{item.naziv}</Text>
            <Text style={[styles.cell, { flex: 2 }]}>{item.cena.toFixed(2)}</Text>
            <View style={[styles.cell, { flex: 3, flexDirection: 'row', gap: 4 }]}>
              <Button title="Izmeni" onPress={() => pripremiIzmenu(item)} />
              <Button title="Obriši" color="#d9534f" onPress={() => obrisiProizvod(item.id)} />
            </View>
          </View>
        )}
      />

      <TextInput
        placeholder="Naziv"
        value={naziv}
        onChangeText={setNaziv}
        style={styles.input}
      />
      <TextInput
        placeholder="Cena"
        value={cena}
        onChangeText={setCena}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button
        title={editId === null ? "Dodaj proizvod" : "Sačuvaj izmenu"}
        onPress={dodajIliIzmeni}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    padding: 20,
    backgroundColor: '#f9f9f9',
    flex: 1
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#333',
    paddingBottom: 6,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  evenRow: {
    backgroundColor: '#e6f2ff',
  },
  oddRow: {
    backgroundColor: '#fff',
  },
  cell: {
    fontSize: 16,
    paddingHorizontal: 4,
  },
  headerCell: {
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    marginBottom: 10,
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
});
