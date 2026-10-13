// src/components/towns/TownSuggestionChip.tsx

import React from 'react';
import { Pressable, Text } from 'react-native';

interface TownSuggestionChipProps {
  label: string;
  onPress: (label: string) => void;
}

export function TownSuggestionChip({
  label,
  onPress,
}: TownSuggestionChipProps) {
  return (
    <Pressable
      onPress={() => onPress(label)}
      className="rounded bg-surface-container px-2.5 py-1.5"
    >
      <Text className="font-label-sm text-label-sm text-primary">
        ◉ {label}
      </Text>
    </Pressable>
  );
}
