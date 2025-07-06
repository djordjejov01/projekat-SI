import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { useFavorites } from './context/FavoriteContext';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { loadFavorites, clearFavorites } = useFavorites();


  const redirectUri = AuthSession.makeRedirectUri({});

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '872083620944-8kpmch9eccq4i4n773tq4qtiu8o1bi3g.apps.googleusercontent.com',
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      fetchUserInfo(response.authentication.accessToken);
    }
  }, [response]);

  const fetchUserInfo = async (token: string) => {
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await res.json();
      console.log('User Info:', user);
      router.replace('./(tabs)/events');
    } catch (err) {
      Alert.alert('Error', 'Failed to get user info');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in both fields');
      return;
    }

    const isValidEmail = email.includes('@');

    if (!isValidEmail) {
      Alert.alert('Login Failed', 'Invalid email format');
      return;
    }

    const criteria = {
      length: password.length >= 8,
      upperLower: /[A-Z]/.test(password) && /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password),
    };

    const isValidPassword = Object.values(criteria).every(Boolean);

    if (!isValidPassword) {
      Alert.alert('Login Failed', 'Invalid password.');
      return;
    }

    try {
      const response = await fetch('http://192.168.188.32:5216/api/User/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();

      if (data.token) {
        await AsyncStorage.setItem('token', data.token); 
        
        //console.log('Login successful. Token:', data.token);
        loadFavorites();
        router.replace('./(tabs)/events');
      } else {
        Alert.alert('Error', 'No token received from server.');
      }
    } catch (error: any) {
      Alert.alert('Login Error', error.message || 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to SyncUp!</Text>

      <TextInput
        style={styles.input}
        placeholder="Email address"
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="••••••••"
          secureTextEntry={!showPassword}
          onChangeText={setPassword}
          value={password}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.toggleText}>
            {showPassword ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity>
        <Text style={styles.forgot}>Forgot your password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Log in</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.signupButton}
        onPress={() => router.push('/signup')}
      >
        <Text style={styles.signupText}>Sign up</Text>
      </TouchableOpacity>

      <View style={styles.orContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>OR</Text>
        <View style={styles.line} />
      </View>

      <TouchableOpacity
        style={[styles.altButton, { marginTop: 10 }]}
        onPress={() => promptAsync()}
        disabled={!request}
      >
        <Text style={{ fontSize: 16 }}>Continue with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 35,
    fontWeight: '700',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
  },
  toggleText: {
    color: '#007AFF',
    fontWeight: '600',
    padding: 6,
  },
  forgot: {
    color: '#FF3B30',
    alignSelf: 'flex-end',
    marginBottom: 24,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#0047FF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  loginText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  signupButton: {
    borderWidth: 1,
    borderColor: '#0047FF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  signupText: {
    color: '#0047FF',
    fontWeight: '600',
    fontSize: 16,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  orText: {
    marginHorizontal: 10,
    fontWeight: '600',
    fontSize: 14,
    color: '#555',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  altButton: {
    borderWidth: 1,
    borderColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
});
