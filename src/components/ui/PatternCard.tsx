// src/components/towns/details/PatternCard.tsx

import React from 'react';
import { Text, View } from 'react-native';

import {
  FlutterDash,
  WaterDrop,
  RadioButtonChecked,
  PestControl,
  Grain,
  Waves,
} from '@material-symbols-svg/react-native';

import type {
  FlyCategory,
  FlyRecommendation,
} from '../../types/fly';

interface PatternCardProps {
  recommendation: FlyRecommendation;
}

const patternIcons = {
  midge: RadioButtonChecked,
  scud: WaterDrop,
  bwo: FlutterDash,
  pmd: FlutterDash,
  caddis: FlutterDash,
  stonefly: PestControl,
  terrestrial: PestControl,
  attractorNymph: Grain,
  worm: Waves,
  streamer: Waves,
} satisfies Record<
  FlyCategory,
  React.ComponentType<any>
>;

export function PatternCard({
  recommendation,
}: PatternCardProps) {
  const {
    pattern,
    score,
    suggestedColor,
    reasons,
  } = recommendation;

  const Icon =
    patternIcons[
      pattern.category
    ];

  const sizeLabel =
    pattern.sizes.length > 1
      ? `#${pattern.sizes[0]}–${
          pattern.sizes[
            pattern.sizes.length - 1
          ]
        }`
      : `#${pattern.sizes[0]}`;

  const colorLabel =
    formatLabel(suggestedColor);

  const reason =
    reasons[0] ??
    pattern.description;

  return (
    <View className="flex-row items-center justify-between rounded-xl bg-surface-container-low p-4 shadow-sm">
      <View className="min-w-0 flex-1 flex-row items-center gap-4">
        <View className="h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-container">
          <Icon
            size={26}
            color="#052215"
          />
        </View>

        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-2">
            <Text
              numberOfLines={1}
              className="shrink font-title-sm text-title-sm text-primary"
            >
              {pattern.name}
            </Text>

            <View className="rounded bg-primary px-1.5 py-0.5">
              <Text className="font-label-sm text-label-sm text-on-primary">
                {sizeLabel}
              </Text>
            </View>
          </View>

          <Text
            numberOfLines={1}
            className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant"
          >
            {reason}
          </Text>

          <View className="mt-1 flex-row items-center gap-2">
            <Text className="font-telemetry text-[11px] uppercase tracking-wider text-secondary">
              {formatLabel(
                pattern.type,
              )}
            </Text>

            <Text className="font-telemetry text-[11px] text-on-surface-variant">
              •
            </Text>

            <Text className="font-telemetry text-[11px] text-on-surface-variant">
              {colorLabel}
            </Text>
          </View>
        </View>
      </View>

      <View className="shrink-0 items-end pl-2">
        <Text className="font-label-sm text-label-sm uppercase text-secondary">
          {getScoreLabel(score)}
        </Text>

        <Text className="font-telemetry text-[11px] text-on-surface-variant">
          Score {score}
        </Text>
      </View>
    </View>
  );
}

function getScoreLabel(
  score: number,
): string {
  if (score >= 10) {
    return 'Top Pick';
  }

  if (score >= 7) {
    return 'Strong';
  }

  if (score >= 5) {
    return 'Good';
  }

  return 'Situational';
}

function formatLabel(
  value: string,
): string {
  return value
    .replace(
      /([a-z])([A-Z])/g,
      '$1 $2',
    )
    .replace(
      /^./,
      char =>
        char.toUpperCase(),
    );
}