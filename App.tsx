import './global.css';

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TownsProvider, useTowns } from './src/context/TownsContext';
import { WeatherProvider } from './src/context/WeatherContext';
import { TownsScreen } from './src/screens/TownsScreen';
import { TownDetailsScreen } from './src/screens/TownDetailsScreen';

import type { RootStackParamList } from './src/navigation/types';
import { LoadingScreen } from './src/components/layout/LoadingScreen';
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <TownsProvider>
        <WeatherProvider>
          <StatusBar barStyle="dark-content" />

          <AppContent />
        </WeatherProvider>
      </TownsProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { isLoading: townsLoading } = useTowns();

  if (townsLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="Towns" component={TownsScreen} />

        <Stack.Screen name="TownDetails" component={TownDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
