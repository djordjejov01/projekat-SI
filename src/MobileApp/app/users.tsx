import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserListScreen() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const jsonUsers = await AsyncStorage.getItem('users');
        if (jsonUsers) {
          setUsers(JSON.parse(jsonUsers));
        }
      } catch (e) {
        console.log('Error loading users:', e);
      }
    };

    loadUsers();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registered Users</Text>
      {users.length === 0 ? (
        <Text>No users found.</Text>
      ) : (
        users.map((user, idx) => (
          <View key={idx} style={styles.userCard}>
            <Text style={styles.label}>Name:</Text>
            <Text>{user.fullName}</Text>
            <Text style={styles.label}>Email:</Text>
            <Text>{user.email}</Text>
            <Text style={styles.label}>Password:</Text>
            <Text>{user.password}</Text>
          </View>
        ))
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
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  userCard: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  label: {
    fontWeight: '700',
  },
});
