import React, { useMemo } from 'react';
import { Text, View } from 'react-native';

import { Verified } from '@material-symbols-svg/react-native';

import type { BiteWindow, HourlyWeather } from '../../types/weather';

import { buildActivitySegments } from '../../functions/weatherFunc';
import {
  formatDateTimeTime,
  formatDecimalHour,
} from '../../functions/func';

interface BiteWindowCardProps {
  biteWindow: BiteWindow | null;
  hourly: HourlyWeather[];
  sunrise: string;
  sunset: string;
}

export type ActivityLevel = 'fair' | 'good' | 'prime' | 'poor';

export interface ActivitySegment {
  level: ActivityLevel;
  startHour: number;
  endHour: number;
  widthPercent: number;
}

export function BiteWindowCard({
  biteWindow,
  hourly,
  sunrise,
  sunset,
}: BiteWindowCardProps) {
  const segments = useMemo(
    () => buildActivitySegments(hourly, sunrise, sunset),
    [hourly, sunrise, sunset],
  );

  if (!biteWindow) {
    return null;
  }
  return (
    <View className="gap-space-md rounded-xl bg-surface-container-low">
      {/* Header */}
      <View className="flex-row items-start justify-between gap-space-sm">
        <View className="min-w-0 flex-1">
          <View className="mb-1 flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full bg-secondary" />

            <Text className="font-label-sm text-label-sm font-semibold uppercase tracking-widest text-secondary">
              Optimal Activity Period
            </Text>
          </View>

          <Text className="font-headline-sm text-headline-sm font-semibold tracking-tight text-primary">
            {formatDecimalHour(biteWindow.startHour)} –{' '}
            {formatDecimalHour(biteWindow.endHour)}
          </Text>

          <Text className="mt-0.5 font-telemetry text-[11px] text-on-surface-variant">
            Estimated thermal activity window
          </Text>
        </View>

        <View className="flex-row items-center gap-1 rounded-full bg-primary px-2.5 py-1">
          <Verified size={14} color="#C1EEBC" />

          <Text className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-primary-fixed">
            {biteWindow.label} Bite
          </Text>
        </View>
      </View>

      {/* Daylight range */}
      <View className="gap-2 pt-space-xs">
        <View className="flex-row items-center justify-between">
          <Text className="font-telemetry text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">
            Daylight Activity Range
          </Text>

          <Text className="font-telemetry text-[11px] font-semibold text-secondary">
            Peak: {formatDecimalHour(biteWindow.peakHour)}
          </Text>
        </View>

        {/* Activity bar */}
        <View className="h-3 w-full flex-row overflow-hidden rounded-full bg-surface-container">
          {segments.map((segment, index) => (
            <ActivityBarSegment
              key={`${segment.startHour}-${segment.endHour}-${index}`}
              segment={segment}
              biteWindow={biteWindow}
            />
          ))}
        </View>

        {/* Time labels */}
        <View className="flex-row items-center justify-between">
          <Text className="font-telemetry text-[10px] text-on-surface-variant">
            {formatDateTimeTime(sunrise)} (Dawn)
          </Text>

          <Text className="font-telemetry text-[10px] font-bold text-primary">
            {formatDecimalHour(biteWindow.startHour)} –{' '}
            {formatDecimalHour(biteWindow.endHour)}
          </Text>

          <Text className="font-telemetry text-[10px] text-on-surface-variant">
            {formatDateTimeTime(sunset)} (Dusk)
          </Text>
        </View>

        {/* Legend */}
        <View className="flex-row items-center justify-center gap-space-md pt-1">
          <LegendItem level="fair" label="Fair" />

          <LegendItem level="good" label="Good" />

          <LegendItem level="prime" label="Peak Window" />
        </View>
      </View>
    </View>
  );
}

interface LegendItemProps {
  level: ActivityLevel;
  label: string;
}

function LegendItem({ level, label }: LegendItemProps) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View
        className={
          level === 'prime'
            ? 'h-2 w-2 rounded-full bg-primary'
            : level === 'good'
            ? 'h-2 w-2 rounded-full bg-secondary-fixed-dim'
            : 'h-2 w-2 rounded-full bg-surface-variant'
        }
      />

      <Text
        className={
          level === 'prime'
            ? 'font-telemetry text-[11px] font-semibold text-primary'
            : 'font-telemetry text-[11px] text-on-surface-variant'
        }
      >
        {label}
      </Text>
    </View>
  );
}

interface ActivityBarSegmentProps {
  segment: ActivitySegment;
  biteWindow: BiteWindow;
}

function ActivityBarSegment({ segment, biteWindow }: ActivityBarSegmentProps) {
  const isPrime = segment.level === 'prime';
  return (
    <View
      className={
        segment.level === 'prime'
          ? 'relative h-full bg-primary'
          : segment.level === 'good'
          ? 'relative h-full bg-secondary-fixed-dim'
          : 'relative h-full bg-surface-variant'
      }
      style={{
        width: `${segment.widthPercent}%`,
      }}
    >
      {isPrime &&
      biteWindow.peakHour >= segment.startHour &&
      biteWindow.peakHour < segment.endHour ? (
        <View
          className="absolute bottom-0 top-0 w-1.5 rounded-full bg-secondary-fixed"
          style={{
            left: `${
              ((biteWindow.peakHour - segment.startHour) /
                (segment.endHour - segment.startHour)) *
              100
            }%`,
          }}
        />
      ) : null}
    </View>
  );
}
