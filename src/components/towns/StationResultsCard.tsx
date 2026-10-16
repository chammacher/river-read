// src/components/towns/StationResultCard.tsx

import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Station } from '../../types/station';
import { stateCodes } from '../../types/states';

interface StationResultCardProps {
  station: Station;
  featured?: boolean;
  onAdd: (station: Station) => void;
}

export function StationResultCard({
  station,
  featured = false,
  onAdd,
}: StationResultCardProps) {
  return (
    <View
      className={
        featured
          ? 'rounded-lg bg-surface-container p-3.5 shadow-sm'
          : 'rounded-lg bg-surface-container-low p-3'
      }
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <View className="flex-row flex-wrap items-center gap-2">
            <Text
              className={
                featured
                  ? 'font-headline-sm text-headline-sm text-primary'
                  : 'font-title-md text-title-md text-primary'
              }
            >
              {station.name}, {stateCodes[station.state]}
            </Text>
          </View>

          <Text className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">
            {station.region} • {station.county}
          </Text>
        </View>

        <Pressable
          onPress={() => onAdd(station)}
          className={
            featured
              ? 'shrink-0 rounded bg-primary-container px-3 py-2'
              : 'shrink-0 rounded bg-surface-container-highest px-3 py-1.5'
          }
        >
          <Text
            className={
              featured
                ? 'font-label-md text-label-md text-on-primary'
                : 'font-label-md text-label-md text-primary'
            }
          >
            + Add
          </Text>
        </Pressable>
      </View>

      <View className="mt-2 flex-row flex-wrap items-center gap-2">
        <Text className="font-telemetry text-telemetry text-on-surface-variant">
          Elev. {station.elevation.toLocaleString()} ft
        </Text>

        {station.stationName ? (
          <>
            <Text className="text-outline-variant">•</Text>

            <Text className="font-telemetry text-telemetry text-on-surface-variant">
              {station.stationName}
            </Text>
          </>
        ) : null}
      </View>
    </View>
  );
}
