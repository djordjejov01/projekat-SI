import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import VideoGameListScreen from './src/screens/VideoGameListScreen';
import VideoGameFormScreen from './src/screens/VideoGameFormScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="List">
        <Stack.Screen
          name="List"
          component={VideoGameListScreen}
          options={{ title: 'Video Igre' }}
        />
        <Stack.Screen
          name="Form"
          component={VideoGameFormScreen}
          options={{ title: 'Dodaj / Izmeni Igru' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
