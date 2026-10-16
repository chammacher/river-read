import { useState } from 'react';
import { ScrollView, Text, View, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/types';
type TownsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Towns'
>;

import { useTowns } from '../context/TownsContext';
import { useWeather } from '../context/WeatherContext';
import { Header } from '../components/layout/Header';
import { TownsList } from '../components/towns/TownsList';
import { EmptyTownsState } from '../components/towns/EmptyTownsState';
import { AddTownDrawer } from '../components/towns/AddDrawer';

export function TownsScreen() {
  const { towns, isLoading, error, addTown, removeTown } = useTowns();
  const {
    weatherMap,
    refreshWeather,
    isRefreshing,
  } = useWeather();
  const [showAddTown, setShowAddTown] = useState(false);
  const navigation = useNavigation<TownsScreenNavigationProp>();
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>{error}</Text>;
  }
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'bottom']}>
      <View className="font-body-md text-body-md text-on-surface flex flex-col min-h-screen">
        <Header onPress={() => setShowAddTown(true)} onBack={() => false} isDetails={false} />
        <ScrollView
          className="flex-1 bg-surface"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => refreshWeather(true)}
            />
          }
        >
          <View className="px-4 mb-6 mt-4">
            <Text className="text-3xl font-semibold text-primary">
              My Towns
            </Text>
            <Text className="mt-1 text-sm text-on-surface-variant">
              {towns.length} Monitored Stations
            </Text>
          </View>
          {towns.length === 0 ? (
            <EmptyTownsState
              onPress={() => setShowAddTown(true)}
              onAddTown={station => {
                addTown(station);
              }}
            />
          ) : (
            <TownsList
              towns={towns}
              weather={weatherMap}
              onRemove={townId => removeTown(townId)}
              onPressTown={town => {
                navigation.navigate('TownDetails', {
                  townId: town.id,
                });
              }}
            />
          )}
        </ScrollView>
        <AddTownDrawer
          visible={showAddTown}
          onClose={() => setShowAddTown(false)}
          onAddTown={station => {
            addTown(station);
            setShowAddTown(false);
          }}
        />
      </View>
    </SafeAreaView>
  );
}
