import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, StyleSheet, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { getPlayers, addPlayer, updatePlayer, deletePlayer } from '../PlayersService'

type Player = {
  id: number;
  name: string;
  team: string;
  position: string;
};

export default function HomeScreen() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [name, setName] = useState('');
  const [team, setTeam] = useState('');
  const [position, setPosition] = useState('');

  // For editing
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editName, setEditName] = useState('');
  const [editTeam, setEditTeam] = useState('');
  const [editPosition, setEditPosition] = useState('');

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const data = await getPlayers();
      setPlayers(data);
    } catch (error) {
      console.error('Failed to fetch players', error);
    }
  };

  const handleAddPlayer = async () => {
    if (!name || !team || !position) {
      Alert.alert('Please fill all fields');
      return;
    }

    try {
      await addPlayer({ name, team, position });
      setName('');
      setTeam('');
      setPosition('');
      fetchPlayers();
    } catch (error) {
      console.error('Failed to add player', error);
      Alert.alert('Error adding player');
    }
  };

  // When clicking Edit button on a player
  const startEdit = (player: Player) => {
    setEditingPlayer(player);
    setEditName(player.name);
    setEditTeam(player.team);
    setEditPosition(player.position);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingPlayer(null);
  };

  // Submit edited data
  const submitEdit = async () => {
    if (!editName || !editTeam || !editPosition) {
      Alert.alert('Please fill all fields');
      return;
    }

    if (!editingPlayer) return;

    try {
      await updatePlayer(editingPlayer.id, {id: editingPlayer.id,  name: editName, team: editTeam, position: editPosition });
      setEditingPlayer(null);
      fetchPlayers();
    } catch (error) {
      console.error('Failed to update player', error);
      Alert.alert('Error updating player');
    }
  };

  const handleDelete = async (id: number) => {
  try {
    await deletePlayer(id);
    // Remove the deleted player from state so UI updates immediately
    setPlayers(players.filter(player => player.id !== id));
  } catch (error) {
    console.error('Failed to delete player', error);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.header}>NBA Players</Text>
      <FlatList
        data={players}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.playerRow}>
            <Text style={styles.player}>
              {item.name}-{item.team}({item.position})
            </Text>
            <TouchableOpacity onPress={() => startEdit(item)} style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Add Player Form */}
      <View style={styles.form}>
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="Team"
          value={team}
          onChangeText={setTeam}
          style={styles.input}
        />
        <TextInput
          placeholder="Position"
          value={position}
          onChangeText={setPosition}
          style={styles.input}
        />
        <Button title="Add Player" onPress={handleAddPlayer} />
      </View>

      {/* Edit Player Form */}
      {editingPlayer && (
        <View style={[styles.form, { marginTop: 40, borderTopWidth: 1, borderTopColor: '#ccc' }]}>
          <Text style={styles.editHeader}>Edit Player</Text>
          <TextInput
            placeholder="Name"
            value={editName}
            onChangeText={setEditName}
            style={styles.input}
          />
          <TextInput
            placeholder="Team"
            value={editTeam}
            onChangeText={setEditTeam}
            style={styles.input}
          />
          <TextInput
            placeholder="Position"
            value={editPosition}
            onChangeText={setEditPosition}
            style={styles.input}
          />
          <View style={styles.editButtonsRow}>
            <Button title="Save" onPress={submitEdit} />
            <View style={{ width: 10 }} />
            <Button title="Cancel" color="red" onPress={cancelEdit} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 50 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  playerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  player: { fontSize: 14 },
  editButton: {
    backgroundColor: '#007bff',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  editButtonText: { color: '#fff', fontWeight: 'bold' },
  form: { marginTop: 30 },
  input: {
    height: 40,
    borderColor: '#666',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  editHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  editButtonsRow: { flexDirection: 'row', justifyContent: 'flex-start' },
  
    deleteButton: {
    marginLeft: 10,
    backgroundColor: '#ff4d4d', // red background for delete
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
