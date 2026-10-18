import React from 'react';
import { Pressable, Text, View } from 'react-native';

import type { Station } from '../../types/station';
import type { CachedTownWeather } from '../../types/weather';
import { getScoreColor } from '../../functions/func';
import { stateCodes } from '../../types/states';
import { WeatherDataState } from '../ui/WeatherDataState';

interface SelectedTownCardProps {
  town: Station;
  weather?: CachedTownWeather;
  weatherLoading?: boolean;
  onPress?: (town: Station) => void;
}

export function SelectedTownCard({
  town,
  onPress,
  weather,
  weatherLoading = false,
}: SelectedTownCardProps) {
  const scoreColor = getScoreColor(weather?.data.current.score.total || 0);
  return (
    <Pressable
      onPress={() => onPress?.(town)}
      className="rounded-xl bg-surface-container p-4 shadow-sm"
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.99 : 1 }],
        opacity: pressed ? 0.95 : 1,
      })}
    >
      {/* Top row */}
      <View className="flex-row items-start justify-between gap-3">
        {/* Town details */}
        <View className="min-w-0 flex-1">
          <Text className="mb-1 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            {town.region} • {town.county}
          </Text>

          <Text
            numberOfLines={1}
            className="font-headline-sm text-headline-sm text-primary"
          >
            {town.name}, {stateCodes[town.state]}
          </Text>
        </View>

        {/* Score */}
        {weather ? (
          <View
            className="shrink-0 rounded-lg border px-3 py-1.5 shadow-sm"
            style={{
              backgroundColor: scoreColor.bgColor,
              borderColor: scoreColor.outline,
            }}
          >
            <View className="flex-row items-center justify-center gap-1">
              <View
                className="h-2 w-2 rounded-full bg-secondary-fixed"
                style={{ backgroundColor: scoreColor.textColor }}
              />

              <Text
                className="font-headline-sm text-[18px] leading-none text-secondary-fixed"
                style={{ color: scoreColor.textColor }}
              >
                {weather.data.current.score.total}
              </Text>
            </View>

            <Text
              className="mt-0.5 text-center font-label-sm text-[10px] uppercase tracking-widest"
              style={{ color: scoreColor.textColor }}
            >
              {weather.data.current.score.label}
            </Text>
          </View>
        ) : (
          <WeatherDataState loading={weatherLoading} compact />
        )}
      </View>

      {/* Bottom detail row */}
      <View className="mt-3 flex-row items-center justify-between rounded-lg bg-surface-container-lowest px-3 py-2">
        <View className="flex-row items-center gap-2">
          {weather ? (
            <>
              <View className="flex-row items-baseline gap-1">
                <Text className="font-title-md text-title-md text-primary">
                  ~{weather.data.current.waterTemp.toFixed(0)}°
                </Text>

                <Text className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Water
                </Text>
              </View>

              <Text className="text-xs text-outline-variant">•</Text>
            </>
          ) : (
            <WeatherDataState loading={weatherLoading} compact />
          )}

          {/* Technique */}
          <View className="flex-row items-center gap-1">
            <Text className="text-[16px] text-tertiary">🐛</Text>

            <Text className="font-body-sm text-body-sm text-tertiary">
              {town.hatch}
            </Text>
          </View>
        </View>

        {/* Log action */}
        <View className="flex-row items-center gap-1">
          <Text className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            Log
          </Text>

          <Text className="text-[18px] text-on-surface-variant">›</Text>
        </View>
      </View>
    </Pressable>
  );
}
