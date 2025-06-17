import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import VideoGameListScreen from './src/screens/VideoGameListScreen';
import VideoGameFormScreen from './src/screens/VideoGameFormScreen';

export type RootStackParamList = {
  List: undefined;
  Form: { id?: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="List">
        <Stack.Screen name="List" component={VideoGameListScreen} />
        <Stack.Screen name="Form" component={VideoGameFormScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}