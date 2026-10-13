import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { fieldNotes } from '../../types/notes';
import { Station } from '../../types/station';
import { EmptyTownsCard } from './EmptyTownsCard';
import { FieldNote } from './FieldNote';
import { RecommendedTownCard } from './RecommendedTownCard';
import { recommendedTowns } from '../../types/recommendedTowns';
import { Explore } from '@material-symbols-svg/react-native';

interface EmptyTownsStateProps {
  onPress(): void;
  onAddTown(station: Station): void;
}

export function EmptyTownsState({ onPress, onAddTown }: EmptyTownsStateProps) {
  return (
    <View className="px-4 pb-24">
      <EmptyTownsCard onAddTown={onPress} />
      <View className="mt-6">
        <View className="mb-1 text-xs flex-row items-center font-semibold uppercase tracking-wider text-primary">
          <Explore width={16} height={16} color="#381200" />
          <Text className="pl-1">Recommended Western Fly Towns</Text>
        </View>

        <Text className="mb-3 text-sm text-on-surface-variant">
          One-tap add to start receiving localized river conditions & hatch
          logs.
        </Text>

        <View className="gap-3">
          {recommendedTowns.map(town => (
            <RecommendedTownCard
              key={town.id}
              town={town}
              isAdded={false}
              onToggle={onAddTown}
            />
          ))}
        </View>
      </View>

      <View className="mt-6">
        <FieldNote
          title={fieldNotes.emptyNote.title}
          icon={fieldNotes.emptyNote.icon}
        >
          {fieldNotes.emptyNote.description}
        </FieldNote>
      </View>
    </View>
  );
}
