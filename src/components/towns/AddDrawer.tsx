// src/components/towns/AddTownDrawer.tsx

import React, { useState, useEffect } from 'react';

import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { searchLocations } from '../../api/location';
import { BottomDrawer } from '../drawer/BottomDrawer';
import { FieldNote } from './FieldNote';
import { fieldNotes } from '../../types/notes';
import { StationResultCard } from './StationResultsCard';
import { TownSuggestionChip } from './TownSuggestionChip';

import { Station } from '../../types/station';

interface AddTownDrawerProps {
  visible: boolean;
  onClose: () => void;
  onAddTown: (station: Station) => void;
}

const popularTowns = [
  'Island Park, ID',
  'Jackson, WY',
  'Ennis, MT',
  'Craig, MT',
  'Twin Bridges, MT',
];

export function AddTownDrawer({
  visible,
  onClose,
  onAddTown,
}: AddTownDrawerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Station[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setIsSearching(true);

        const locations = await searchLocations(query);

        setResults(locations);
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSuggestionPress = (label: string) => {
    const town = label.split(',')[0];

    setQuery(town);
  };
  return (
    <BottomDrawer visible={visible} onClose={onClose}>
      {/* Header */}
      <View className="px-5 pb-4 pt-2">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="font-headline-lg-mobile text-headline-lg-mobile text-primary">
              Add Town / Station
            </Text>

            <Text className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">
              Link municipal atmospheric stations to regional hydrology
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            accessibilityLabel="Close drawer"
            className="h-8 w-8 items-center justify-center rounded-full bg-surface-container-high"
          >
            <Text className="text-lg text-on-surface">×</Text>
          </Pressable>
        </View>

        {/* Search */}
        <View className="mt-4">
          <View className="flex-row items-center gap-2 rounded-lg bg-surface-container-low p-2.5 shadow-sm">
            <Text className="text-xl text-primary">⌕</Text>

            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search town or station"
              placeholderTextColor="#727973"
              className="min-w-0 flex-1 font-body-md text-body-md text-primary"
              autoCorrect={false}
              autoCapitalize="words"
              returnKeyType="search"
            />

            {query.length > 0 ? (
              <Pressable
                onPress={() => setQuery('')}
                accessibilityLabel="Clear search"
                className="h-6 w-6 items-center justify-center rounded-full bg-surface-container-high"
              >
                <Text className="text-on-surface-variant">×</Text>
              </Pressable>
            ) : null}
          </View>

          <View className="mt-2 flex-row items-center justify-between px-1">
            <Text className="flex-1 font-telemetry text-telemetry text-on-surface-variant">
              NOAA Meso Stations
            </Text>

            <Text className="font-label-sm text-label-sm text-secondary">
              SYNCHRONIZED
            </Text>
          </View>
        </View>
      </View>

      {/* Scroll area */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-5 pb-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Results */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="h-2 w-2 rounded-full bg-secondary" />

              <Text className="font-label-sm text-label-sm uppercase tracking-wider text-primary">
                Matched Municipal Stations ({results.length} Found)
              </Text>
            </View>
          </View>
          {results.map((station) => (
            <StationResultCard
              key={station.id}
              station={station}
              onAdd={onAddTown}
            />
          ))}

          {results.length === 0 ? (
            <View className="items-center rounded-lg bg-surface-container-low p-6">
              <Text className="font-title-md text-title-md text-primary">
                No stations found
              </Text>

              <Text className="mt-1 text-center font-body-sm text-body-sm text-on-surface-variant">
                Try another town, county, or region.
              </Text>
            </View>
          ) : null}
        </View>

        {/* Popular */}
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              Frequently Monitored Fly Hubs
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-1.5">
            {popularTowns.map(town => (
              <TownSuggestionChip
                key={town}
                label={town}
                onPress={handleSuggestionPress}
              />
            ))}
          </View>
        </View>

        <View className="mt-6">
          <FieldNote
            title={fieldNotes.addNote.title}
            icon={fieldNotes.addNote.icon}
          >
            {fieldNotes.addNote.description}
          </FieldNote>
        </View>
      </ScrollView>
    </BottomDrawer>
  );
}
