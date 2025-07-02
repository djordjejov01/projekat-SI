import React, { useState, useEffect,useRef } from 'react';
import { Link } from 'expo-router';
import { router } from 'expo-router';
import { Animated } from 'react-native';

import {
  View,
  Text,
  TextInput,
  Switch,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (pw: string) => {
    return (
      pw.length >= 8 &&
      /[A-Z]/.test(pw) &&
      /[a-z]/.test(pw) &&
      /[0-9]/.test(pw) &&
      /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(pw)
    );
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('All fields are required');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Invalid email address');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Password must meet all the listed requirements');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }

    try {
    const response = await fetch('http://192.168.1.3:5216/api/User/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: fullName,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
        role:'MobileUser'
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    Alert.alert('Success', 'Account created successfully!', [
      {
        text: 'OK',
        onPress: () => router.replace('/login'),
      },
    ]);
  } catch (error: any) {
    console.error('Registration error:', error);
    Alert.alert('Error', error.message || 'Something went wrong');
  }
};
  
  type CriteriaKey = 'length' | 'upperLower' | 'number' | 'special';

 const criteria: Record<CriteriaKey, boolean> = {
  length: password.length >= 8,
  upperLower: /[A-Z]/.test(password) && /[a-z]/.test(password),
  number: /[0-9]/.test(password),
  special: /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password),
};

const fadeAnims: Record<CriteriaKey, Animated.Value> = {
  length: useRef(new Animated.Value(0.3)).current,
  upperLower: useRef(new Animated.Value(0.3)).current,
  number: useRef(new Animated.Value(0.3)).current,
  special: useRef(new Animated.Value(0.3)).current,
};



useEffect(() => {
  (Object.keys(criteria) as CriteriaKey[]).forEach((key) => {
    Animated.timing(fadeAnims[key], {
      toValue: criteria[key] ? 1 : 0.3,
      duration: 300,
      useNativeDriver: false,
    }).start();
  });
}, [password]);



  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Your Account</Text>

      <TextInput
        style={styles.input}
        placeholder="John Doe"
        placeholderTextColor='#888'
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        style={styles.input}
        placeholder="john.doe@gmail.com"
        placeholderTextColor='#888'
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor='#888'
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.requirementsTitle}>Password must:</Text>
      <View style={styles.requirements}>
      <Animated.Text style={[styles.reqItem, { opacity: fadeAnims.length }]}>
        • At least 8 characters
      </Animated.Text>
      <Animated.Text style={[styles.reqItem, { opacity: fadeAnims.upperLower }]}>
        • Uppercase and lowercase letters
      </Animated.Text>
      <Animated.Text style={[styles.reqItem, { opacity: fadeAnims.number }]}>
        • At least one number
      </Animated.Text>
      <Animated.Text style={[styles.reqItem, { opacity: fadeAnims.special }]}>
        • One special character
      </Animated.Text>
    </View>


      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm Password"
          placeholderTextColor='#888'
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Text style={styles.toggleText}>
            {showConfirmPassword ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

      <View style={{ alignItems: 'center' }}>
        <Text style={styles.loginLink}>
          Already have an account?{' '}
         <Link href="/login" asChild>
          <TouchableOpacity>
            <Text style={styles.link}>Log In</Text>
          </TouchableOpacity>
        </Link>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 14,
    marginBottom: 16,
    height: 50,
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
  requirementsTitle: {
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 14,
  },
  requirements: {
    marginBottom: 16,
    paddingLeft: 8,
  },
  reqItem: {
    fontSize: 13,
    marginBottom: 2,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxText: {
    marginLeft: 10,
    fontSize: 13,
    flex: 1,
    flexWrap: 'wrap',
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  loginLink: {
    textAlign: 'center',
    paddingTop: 30,
    color: '#555',
    fontSize: 14,
  },
});
