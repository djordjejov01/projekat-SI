import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  FlatList, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ScrollView
} from 'react-native';

const API_URL = 'https://192.168.1.5:7035/api/Animes';  // Zameni sa svojim API-jem

export default function App() {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Forma sa 4 polja
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [episodes, setEpisodes] = useState('');
  const [score, setScore] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchAnimes = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setAnimes(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load animes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimes();
  }, []);

  // Validacija
  const validateForm = () => {
    if (!name.trim() || !type.trim()) {
      Alert.alert('Validation error', 'Name and Type are required');
      return false;
    }
    if (episodes && isNaN(Number(episodes))) {
      Alert.alert('Validation error', 'Episodes must be a number');
      return false;
    }
    if (score && (isNaN(Number(score)) || Number(score) < 0 || Number(score) > 10)) {
      Alert.alert('Validation error', 'Score must be a number between 0 and 10');
      return false;
    }
    return true;
  };

  const clearForm = () => {
    setName('');
    setType('');
    setEpisodes('');
    setScore('');
    setEditingId(null);
  };

  // Dodavanje
  const addAnime = async () => {
    if (!validateForm()) return;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          episodes,
          score: score ? Number(score) : null,
        }),
      });
      if (res.ok) {
        clearForm();
        fetchAnimes();
      } else {
        Alert.alert('Error', 'Failed to add anime');
      }
    } catch {
      Alert.alert('Error', 'Failed to add anime');
    }
  };

  // Izmena
  const updateAnime = async () => {
    if (!validateForm() || editingId === null) return;
    try {
      const res = await fetch(`${API_URL}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          name,
          type,
          episodes,
          score: score ? Number(score) : null,
        }),
      });
      if (res.ok) {
        clearForm();
        fetchAnimes();
      } else {
        Alert.alert('Error', 'Failed to update anime');
      }
    } catch {
      Alert.alert('Error', 'Failed to update anime');
    }
  };

  // Brisanje
  const deleteAnime = async (id : number) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchAnimes();
      } else {
        Alert.alert('Error', 'Failed to delete anime');
      }
    } catch {
      Alert.alert('Error', 'Failed to delete anime');
    }
  };

  // Pokretanje editovanja
  const startEdit = (anime) => {
    setName(anime.name);
    setType(anime.type);
    setEpisodes(anime.episodes ? anime.episodes.toString() : '');
    setScore(anime.score ? anime.score.toString() : '');
    setEditingId(anime.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <TextInput 
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput 
            style={styles.input}
            placeholder="Type"
            value={type}
            onChangeText={setType}
          />
          <TextInput 
            style={styles.input}
            placeholder="Episodes"
            value={episodes}
            onChangeText={setEpisodes}
            keyboardType="numeric"
          />
          <TextInput 
            style={styles.input}
            placeholder="Score (0-10)"
            value={score}
            onChangeText={setScore}
            keyboardType="numeric"
          />

          <View style={styles.buttonsRow}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={editingId === null ? addAnime : updateAnime}
            >
              <Text style={styles.buttonText}>{editingId === null ? 'Add' : 'Update'}</Text>
            </TouchableOpacity>

            {editingId !== null && (
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: 'grey' }]} 
                onPress={clearForm}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <FlatList 
          data={animes}
          keyExtractor={(item) => item.id.toString()}
          refreshing={loading}
          onRefresh={fetchAnimes}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={{flex: 1}}>
                <Text style={styles.itemText}><Text style={{fontWeight: 'bold'}}>Name:</Text> {item.name}</Text>
                <Text style={styles.itemText}><Text style={{fontWeight: 'bold'}}>Type:</Text> {item.type}</Text>
                <Text style={styles.itemText}><Text style={{fontWeight: 'bold'}}>Episodes:</Text> {item.episodes}</Text>
                <Text style={styles.itemText}><Text style={{fontWeight: 'bold'}}>Score:</Text> {item.score}</Text>
              </View>
              <View style={styles.itemButtons}>
                <TouchableOpacity onPress={() => startEdit(item)} style={styles.editButton}>
                  <Text>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteAnime(item.id)} style={styles.deleteButton}>
                  <Text>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  form: { marginBottom: 20 },
  input: {
    borderWidth: 1, 
    borderColor: '#ccc', 
    padding: 10, 
    borderRadius: 5, 
    marginBottom: 10
  },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { 
    flex: 1,
    backgroundColor: 'blue', 
    padding: 12, 
    borderRadius: 5, 
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
  item: { 
    flexDirection: 'row', 
    padding: 12, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 5,
    alignItems: 'center'
  },
  itemText: { fontSize: 14 },
  itemButtons: { flexDirection: 'row' },
  editButton: { 
    marginRight: 10, 
    backgroundColor: 'orange', 
    padding: 8, 
    borderRadius: 5 
  },
  deleteButton: { 
    backgroundColor: 'red', 
    padding: 8, 
    borderRadius: 5 
  },
});