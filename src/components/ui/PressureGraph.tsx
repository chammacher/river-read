import React, { useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  Text,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Line,
  Path,
} from 'react-native-svg';

import type { HourlyWeather } from '../../../types/weather';

interface PressureGraphProps {
  hourly: HourlyWeather[];
  currentTime: string;
  baselinePressure: number;
}

const GRAPH_HEIGHT = 100;
const GRAPH_PADDING_TOP = 10;
const GRAPH_PADDING_BOTTOM = 10;

export function PressureGraph({
  hourly,
  currentTime,
  baselinePressure,
}: PressureGraphProps) {
  const [graphWidth, setGraphWidth] =
    useState(0);

  const currentDate =
    currentTime.split('T')[0];

  /*
   * Only graph today's pressure values.
   */
  const todayHourly = useMemo(
    () =>
      hourly.filter(hour =>
        hour.time.startsWith(
          currentDate,
        ),
      ),
    [hourly, currentDate],
  );

  const graph = useMemo(() => {
    if (
      todayHourly.length === 0 ||
      graphWidth === 0
    ) {
      return null;
    }

    const pressures =
      todayHourly.map(
        hour => hour.pressure,
      );

    /*
     * Include baseline in the visible
     * pressure range so the reference line
     * never falls outside the graph.
     */
    const rawMin = Math.min(
      ...pressures,
      baselinePressure,
    );

    const rawMax = Math.max(
      ...pressures,
      baselinePressure,
    );

    /*
     * Small amount of vertical padding makes
     * subtle pressure changes easier to see.
     */
    const minPressure =
      Math.floor(rawMin - 1);

    const maxPressure =
      Math.ceil(rawMax + 1);

    const pressureRange =
      maxPressure - minPressure || 1;

    const usableHeight =
      GRAPH_HEIGHT -
      GRAPH_PADDING_TOP -
      GRAPH_PADDING_BOTTOM;

    const getX = (
      index: number,
    ) => {
      if (
        todayHourly.length === 1
      ) {
        return graphWidth / 2;
      }

      return (
        (index /
          (todayHourly.length - 1)) *
        graphWidth
      );
    };

    const getY = (
      pressure: number,
    ) => {
      const normalized =
        (pressure - minPressure) /
        pressureRange;

      return (
        GRAPH_PADDING_TOP +
        (1 - normalized) *
          usableHeight
      );
    };

    const path = todayHourly
      .map((hour, index) => {
        const x = getX(index);
        const y = getY(
          hour.pressure,
        );

        return `${
          index === 0 ? 'M' : 'L'
        } ${x} ${y}`;
      })
      .join(' ');

    const currentIndex =
      todayHourly.findIndex(
        hour =>
          hour.time.substring(
            0,
            13,
          ) ===
          currentTime.substring(
            0,
            13,
          ),
      );

    return {
      minPressure,
      maxPressure,
      getX,
      getY,
      path,
      currentIndex,
      baselineY:
        getY(baselinePressure),
    };
  }, [
    todayHourly,
    graphWidth,
    baselinePressure,
    currentTime,
  ]);

  function handleLayout(
    event: LayoutChangeEvent,
  ) {
    setGraphWidth(
      event.nativeEvent.layout.width,
    );
  }

  if (todayHourly.length === 0) {
    return null;
  }

  return (
    <View className="gap-space-sm">
      {/* Graph */}
      <View
        className="relative mt-space-xs h-[100px] w-full"
        onLayout={handleLayout}
      >
        {graph &&
        graphWidth > 0 ? (
          <Svg
            width={graphWidth}
            height={GRAPH_HEIGHT}
          >
            {/* Top guide */}
            <Line
              x1={0}
              y1={
                GRAPH_PADDING_TOP
              }
              x2={graphWidth}
              y2={
                GRAPH_PADDING_TOP
              }
              stroke="#00000020"
              strokeWidth={1}
            />

            {/* Bottom guide */}
            <Line
              x1={0}
              y1={
                GRAPH_HEIGHT -
                GRAPH_PADDING_BOTTOM
              }
              x2={graphWidth}
              y2={
                GRAPH_HEIGHT -
                GRAPH_PADDING_BOTTOM
              }
              stroke="#00000020"
              strokeWidth={1}
            />

            {/* 3-day baseline */}
            <Line
              x1={0}
              y1={
                graph.baselineY
              }
              x2={graphWidth}
              y2={
                graph.baselineY
              }
              stroke="#6B776B"
              strokeWidth={1}
              strokeDasharray="4 4"
            />

            {/* Pressure */}
            <Path
              d={graph.path}
              fill="none"
              stroke="#18392B"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Current time */}
            {graph.currentIndex >=
              0 && (
              <>
                <Line
                  x1={graph.getX(
                    graph.currentIndex,
                  )}
                  y1={0}
                  x2={graph.getX(
                    graph.currentIndex,
                  )}
                  y2={
                    GRAPH_HEIGHT
                  }
                  stroke="#83A98C"
                  strokeWidth={1}
                  strokeDasharray="3 4"
                />

                <Circle
                  cx={graph.getX(
                    graph.currentIndex,
                  )}
                  cy={graph.getY(
                    todayHourly[
                      graph
                        .currentIndex
                    ].pressure,
                  )}
                  r={4}
                  fill="#18392B"
                />
              </>
            )}
          </Svg>
        ) : null}

        {/* Pressure scale */}
        {graph && (
          <>
            <Text className="absolute -top-1 right-0 font-telemetry text-[9px] text-on-surface-variant">
              {graph.maxPressure}{' '}
              hPa
            </Text>

            <Text className="absolute -bottom-1 right-0 font-telemetry text-[9px] text-on-surface-variant">
              {graph.minPressure}{' '}
              hPa
            </Text>
          </>
        )}
      </View>

      {/* Time labels */}
      <View className="flex-row justify-between">
        <Text className="font-telemetry text-[10px] text-on-surface-variant">
          12 AM
        </Text>

        <Text className="font-telemetry text-[10px] text-on-surface-variant">
          6 AM
        </Text>

        <Text className="font-telemetry text-[10px] text-on-surface-variant">
          12 PM
        </Text>

        <Text className="font-telemetry text-[10px] text-on-surface-variant">
          6 PM
        </Text>

        <Text className="font-telemetry text-[10px] text-on-surface-variant">
          12 AM
        </Text>
      </View>

      {/* Legend */}
      <View className="flex-row items-center gap-space-md border-t border-outline-variant/20 pt-space-sm">
        <View className="flex-row items-center gap-1.5">
          <View className="h-0.5 w-4 bg-primary" />

          <Text className="font-telemetry text-[10px] text-on-surface-variant">
            Hourly Pressure
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5">
          <Svg
            width={18}
            height={4}
          >
            <Line
              x1={0}
              y1={2}
              x2={18}
              y2={2}
              stroke="#6B776B"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          </Svg>

          <Text className="font-telemetry text-[10px] text-on-surface-variant">
            3-Day Baseline
          </Text>
        </View>
      </View>
    </View>
  );
}