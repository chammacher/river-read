// src/screens/TownDetailsScreen.tsx

import React from 'react';

import { ScrollView, Text, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Update,
  Phishing,
  Tune,
  DeviceThermostat,
  Thermostat,
  Water,
  Compress,
  FilterDrama,
  Rainy,
  Schedule,
  PestControl,
} from '@material-symbols-svg/react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
type TownDetailsRouteProp = RouteProp<RootStackParamList, 'TownDetails'>;
type TownDetailsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TownDetails'
>;

import { stateCodes } from '../types/states';
import {
  formatCoordinate,
  getScoreColor,
  getWeatherAgeMinutes,
} from '../functions/func';
import {
  clarityPhrase,
  getCloudCoverage,
  cloudCoveragePhrase,
} from '../functions/weatherFunc';
import { Header } from '../components/layout/Header';
import { useTowns } from '../context/TownsContext';
import { useWeather } from '../context/WeatherContext';
import { MetricCard } from '../components/ui/MetricCard';
import { PatternCard } from '../components/ui/PatternCard';
import { BiteWindowCard } from '../components/ui/BiteWindowCard';
import { PressureGraph } from '../components/ui/PressureGraph';
import { DetailsSectionHeader } from '../components/ui/DetailsSectionHeader';

export function TownDetailsScreen() {
  const route = useRoute<TownDetailsRouteProp>();
  const navigation = useNavigation<TownDetailsNavigationProp>();

  const { townId } = route.params;
  const { getTown, removeTown } = useTowns();
  const { getWeather, refreshWeather, isRefreshing } = useWeather();

  const weather = getWeather(townId);
  if (!weather) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <View className="flex-1 items-center justify-center px-gutter">
          <Text className="font-headline-sm text-headline-sm font-semibold text-primary">
            Weather Unavailable
          </Text>

          <Text className="mt-space-sm text-center font-telemetry text-[11px] text-on-surface-variant">
            No weather data has been saved for this location yet. Connect to the
            internet and refresh to load current conditions.
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  const town = getTown(townId);
  // If the town is not found, return null or handle the error appropriately
  if (!town) {
    return null;
  }
  const dailyWeather = weather?.data?.daily[weather.data.daily.length / 2];
  const currentWeather = weather.data?.current;
  const hourlyWeather = weather.data?.hourly;
  const waterTempPercent = (
    ((currentWeather.waterTemp - 40) / 30) *
    100
  ).toFixed(0);

  const scoreColor = getScoreColor(currentWeather.score.total);
  const cloudCoverage = getCloudCoverage(currentWeather.cloudCover);

  const cloudPhrase = cloudCoveragePhrase[cloudCoverage];

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'bottom']}>
      <View className="flex-1 bg-surface">
        <Header
          isDetails
          onPress={() => {
            navigation.navigate('Towns');
            removeTown(townId);
          }}
          onBack={() => navigation.navigate('Towns')}
        >
          <View className="mb-space-xs flex-1 flex-row items-start justify-between gap-space-sm pb-5">
            <View className="min-w-0 flex-1">
              <Text className="font-headline-md text-headline-md tracking-tight text-primary">
                {town.name}, {stateCodes[town.state]}
              </Text>

              <Text className="mt-0.5 font-telemetry text-telemetry text-on-surface-variant">
                Elev. {town.elevation} ft •{' '}
                {formatCoordinate(town.latitude, 'latitude')}{' '}
                {formatCoordinate(town.longitude, 'longitude')}
              </Text>
            </View>
          </View>
        </Header>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-10"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => refreshWeather(true)}
            />
          }
        >
          {/* Station summary */}
          <View className="px-margin-mobile pt-space-md">
            <View className="rounded-xl bg-surface-container-low p-space-md shadow-sm">
              <View className="mt-space-sm flex-row items-center gap-space-xs rounded-lg bg-surface-container-lowest/60 p-2">
                <Update size={18} color="#052215" />

                <Text className="flex-1 font-body-sm text-body-sm text-on-surface-variant">
                  Synchronized {getWeatherAgeMinutes(weather.lastUpdated)}m ago
                  • Municipal Weather & Open-Meteo Best Match
                </Text>
              </View>

              {/* Fishability */}
              <View className="mt-space-md gap-space-sm rounded-xl bg-primary p-space-md shadow-md">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-space-xs">
                    <Phishing size={22} color="#C1EEBC" />

                    <Text className="font-label-md text-label-md uppercase tracking-widest text-primary-fixed">
                      Fishability Index
                    </Text>
                  </View>

                  <View
                    className="flex-row items-center gap-1 rounded-full border px-2.5 py-1"
                    style={{
                      backgroundColor: scoreColor.bgColor,
                      borderColor: scoreColor.outline,
                    }}
                  >
                    <View
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: scoreColor.textColor }}
                    />

                    <Text
                      className="font-label-sm text-label-sm uppercase tracking-wider"
                      style={{ color: scoreColor.textColor }}
                    >
                      {currentWeather.score.total}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-baseline gap-space-sm">
                  <Text className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-primary">
                    {currentWeather.score.total}
                  </Text>

                  <Text className="font-telemetry text-telemetry text-primary-fixed-dim">
                    / 10.0 Peak Activity Target
                  </Text>
                </View>

                {/** TODO: replace this when decision graph is created for hatch and recommendations */}
                <Text className="font-body-md text-body-md leading-snug text-primary-fixed">
                  {currentWeather.score.reasons.join('. ')}
                </Text>
              </View>
            </View>
          </View>

          {/* Metrics */}
          <View className="mt-space-lg px-margin-mobile">
            <DetailsSectionHeader
              title="Hydrographic & Meso Metrics"
              meta=""
              icon={Tune}
            />

            <View className="flex-row gap-space-sm">
              <MetricCard
                label="Water Temp"
                value={currentWeather.waterTemp.toFixed(0) + '°F'}
                status="Optimal Feeding"
                footer={`Diurnal spread ${currentWeather.waterTempMin.toFixed(
                  0,
                )}°F – ${currentWeather.waterTempMax.toFixed(0)}°F`}
                icon={DeviceThermostat}
                statusAccent
              />

              <MetricCard
                label="Air Temp"
                value={currentWeather.temperature.toFixed(0) + '°F'}
                status={`Feels like ${currentWeather.apparentTemperature.toFixed(
                  0,
                )}°F`}
                footer={`High ${dailyWeather.temperatureMax.toFixed(
                  0,
                )}°F • Low ${dailyWeather.temperatureMin.toFixed(0)}°F`}
                icon={Thermostat}
              />
            </View>
            <View className="mt-space-sm flex-row gap-space-sm">
              <MetricCard
                label="Clarity & Flow"
                footer={'River ' + clarityPhrase[currentWeather.clarity.river]}
                secondFooter={
                  'Headwater ' + clarityPhrase[currentWeather.clarity.headwater]
                }
                icon={Water}
                statusAccent
              />

              {/* Sky */}
              <MetricCard
                label="Sky Condition"
                value={`${currentWeather.cloudCover}% Coverage`}
                status={cloudPhrase}
                icon={FilterDrama}
              />
            </View>

            <View className="mt-space-sm rounded-xl bg-surface-container-low p-space-md shadow-sm">
              <View className="mb-space-xs flex-row items-center justify-between">
                <View className="flex-row items-center gap-space-xs">
                  <Compress size={18} color="#052215" />

                  <Text className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                    MSL Barometer
                  </Text>
                </View>

                <Text className="font-telemetry text-telemetry font-bold text-primary">
                  {currentWeather.pressure?.current}
                </Text>
              </View>

              <PressureGraph
                hourly={hourlyWeather}
                currentTime={currentWeather.time}
                baselinePressure={currentWeather.pressure.baseline}
              />
            </View>

            {/* Rain */}
            <View className="mt-space-sm rounded-xl bg-surface-container-low p-space-md shadow-sm">
              <View className="mb-space-xs flex-row items-center justify-between">
                <View className="flex-row items-center gap-space-xs">
                  <Rainy size={18} color="#406840" />

                  <Text className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                    Precipitation Status
                  </Text>
                </View>
              </View>

              <View className="flex-row flex-wrap items-center gap-2 rounded bg-surface-container p-space-sm">
                <Text className="font-telemetry text-telemetry text-primary">
                  {currentWeather.last24Hours.toFixed(2)} in / past 24h
                </Text>

                <Text className="text-on-surface-variant">•</Text>

                <Text className="font-telemetry text-telemetry text-primary">
                  {currentWeather.next48Hours.toFixed(2)} in / next 48h
                </Text>
              </View>
            </View>
          </View>

          {/* Telemetry */}
          <View className="mt-space-lg px-margin-mobile">
            <DetailsSectionHeader
              title="Diurnal Feeding & Bite Window"
              meta=""
              icon={Schedule}
            />

            <View className="rounded-xl bg-surface-container-low p-space-md shadow-sm">
              <BiteWindowCard
                biteWindow={currentWeather.biteWindow}
                hourly={hourlyWeather}
                sunrise={currentWeather.sunrise}
                sunset={currentWeather.sunset}
              />

              <View className="mt-space-sm pt-space-sm border-t border-outline-variant/20">
                <View className="flex-row items-center justify-between">
                  <Text className="font-body-sm text-body-sm text-on-surface">
                    Trout Stress Limit
                  </Text>

                  <Text className="font-telemetry text-telemetry text-secondary">
                    Safe Margin ({(currentWeather.waterTemp - 70).toFixed(0)}°F)
                  </Text>
                </View>

                <View className="relative mt-2 h-3 flex-row overflow-hidden rounded-full bg-surface-container">
                  <View className="h-full w-[83%] bg-secondary-fixed-dim" />
                  <View className="h-full flex-1 bg-tertiary-fixed-dim" />

                  <View
                    className={`absolute bottom-0 top-0 w-1 bg-primary`}
                    style={{ left: waterTempPercent + '%' }}
                  />
                </View>

                <View className="mt-1 flex-row justify-between">
                  <Text className="font-telemetry text-[10px] text-on-surface-variant">
                    40°F Base
                  </Text>

                  <Text className="font-telemetry text-[10px] font-bold text-primary">
                    {currentWeather.waterTemp.toFixed(0)}°F
                  </Text>

                  <Text className="font-telemetry text-[10px] text-on-surface-variant">
                    Stress: 70°F
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Fly suggestions */}
          <View className="mt-space-lg px-margin-mobile">
            <DetailsSectionHeader
              title="Entomology & Selected Patterns"
              meta=""
              icon={PestControl}
            />
            <View className="gap-space-sm">
              {currentWeather.flyRecommendations.slice(0, 3).map(pattern => (
                <PatternCard key={pattern.pattern.id} recommendation={pattern} />
              ))}
            </View>
          </View>

          {/* Field note
          <View className="mt-space-lg px-margin-mobile">
          <FieldNote
                    title={fieldNotes.listNote.title}
                    icon={fieldNotes.listNote.icon}
                  >
                    {fieldNotes.listNote.description}
                  </FieldNote>
                  </View>*/}

          {/* Actions
          <View className="mt-space-lg gap-space-sm px-margin-mobile">
            <Pressable className="flex-row items-center justify-center gap-space-xs rounded-lg bg-primary px-space-md py-3.5">
              <HistoryEdu size={20} color="#FFFFFF" />

              <Text className="font-title-sm text-title-sm text-on-primary">
                Record Field Catch Log
              </Text>
            </Pressable>

            <View className="flex-row gap-space-sm">
              <Pressable className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg bg-surface-container px-space-sm py-3">
                <NotificationsActive size={18} color="#052215" />

                <Text className="font-label-md text-label-md uppercase tracking-wider text-primary">
                  Set Hydro Alert
                </Text>
              </Pressable>

              <Pressable
                accessibilityLabel="Share telemetry register"
                className="items-center justify-center rounded-lg bg-surface-container p-3"
              >
                <IosShare size={20} color="#052215" />
              </Pressable>
            </View>
          </View>*/}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
