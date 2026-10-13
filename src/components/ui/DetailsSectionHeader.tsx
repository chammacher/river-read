// src/components/towns/details/DetailsSectionHeader.tsx

import React from 'react';
import { Text, View } from 'react-native';

interface DetailsSectionHeaderProps {
  title: string;
  meta?: string;
  icon: React.ComponentType<any>;
}

export function DetailsSectionHeader({
  title,
  meta,
  icon: Icon,
}: DetailsSectionHeaderProps) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <View className="flex-row items-center gap-1.5">
        <Icon size={20} color="#406840" />

        <Text className="font-title-md text-title-md text-primary">
          {title}
        </Text>
      </View>

      {meta ? (
        <Text className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
          {meta}
        </Text>
      ) : null}
    </View>
  );
}
