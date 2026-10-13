// src/context/WeatherContext.tsx

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { fetchTownWeather } from '../api/weather';
import { useTowns } from './TownsContext';
import {
  loadWeatherCache,
  saveWeatherCache,
} from '../storage/weatherStorage';
import {
  isWeatherStale,
} from '../functions/func';
import type {
  CachedTownWeather,
  TownWeather,
} from '../types/weather';

type CachedTownWeatherMap =
  Map<string, CachedTownWeather>;

interface WeatherContextValue {
  weatherMap: CachedTownWeatherMap;

  isLoading: boolean;
  isCacheLoaded: boolean;
  isRefreshing: boolean;

  error: string | null;

  getWeather: (
    townId: string,
  ) => CachedTownWeather | undefined;

  getCachedWeather: (
    townId: string,
  ) => CachedTownWeather | undefined;

  refreshWeather: (
    force?: boolean,
  ) => Promise<void>;
}

const WeatherContext =
  createContext<
    WeatherContextValue | undefined
  >(undefined);

export function WeatherProvider({
  children,
}: PropsWithChildren) {
  const {
    towns,
    isLoading: townsLoading,
  } = useTowns();

  const [
    weatherMap,
    setWeatherMap,
  ] = useState<CachedTownWeatherMap>(
    () => new Map(),
  );

  const [
    isCacheLoaded,
    setIsCacheLoaded,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

const [isRefreshing, setIsRefreshing] =
  useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  /*
   * Load cached weather once when the
   * provider starts.
   */
  useEffect(() => {
    async function initializeWeather() {
      try {
        const cachedWeather =
          await loadWeatherCache();

        setWeatherMap(
          cachedWeather,
        );
      } catch (err) {
        console.error(
          'Unable to load weather cache:',
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load cached weather',
        );
      } finally {
        setIsCacheLoaded(true);
      }
    }

    initializeWeather();
  }, []);

  /*
   * Save the cache whenever weather data
   * changes.
   */
  useEffect(() => {
    if (!isCacheLoaded) {
      return;
    }

    saveWeatherCache(
      weatherMap,
    ).catch(err => {
      console.error(
        'Unable to save weather cache:',
        err,
      );
    });
  }, [
    weatherMap,
    isCacheLoaded,
  ]);

  /*
   * Fetch fresh weather and merge it into
   * the existing cache.
   */
  const refreshWeather =
    useCallback(
      async (
        force = false,
      ) => {
        if (
          townsLoading ||
          !isCacheLoaded
        ) {
          return;
        }

        if (towns.length === 0) {
          setIsLoading(false);
          setError(null);
          return;
        }

        const townsToRefresh =
          force
            ? towns
            : towns.filter(
                town => {
                  const cached =
                    weatherMap.get(
                      town.id,
                    );

                  if (!cached) {
                    return true;
                  }

                  return isWeatherStale(
                    cached.lastUpdated,
                  );
                },
              );

        if (
          townsToRefresh.length === 0
        ) {
          return;
        }
        setIsRefreshing(true);
        setIsLoading(true);
        setError(null);

        try {
          const fetchedWeather =
            await fetchTownWeather(
              townsToRefresh,
            );

          const now =
            new Date().toISOString();

          setWeatherMap(
            current => {
              const updated =
                new Map(current);

              fetchedWeather.forEach(
                (
                  weather,
                  townId,
                ) => {
                  updated.set(
                    townId,
                    {
                      data: weather,
                      lastUpdated:
                        now,
                    },
                  );
                },
              );

              return updated;
            },
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load weather',
          );
        } finally {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      },
      [
        towns,
        townsLoading,
        isCacheLoaded,
        weatherMap,
      ],
    );

  /*
   * Refresh after both towns and cached
   * weather have finished loading.
   */
   useEffect(() => {
     if (
       townsLoading ||
       !isCacheLoaded
     ) {
       return;
     }

     refreshWeather();
   }, [
     townsLoading,
     isCacheLoaded,
     refreshWeather,
   ]);

  /*
   * Most screens only care about the
   * actual weather data.
   */
  const getWeather =
    useCallback(
      (
        townId: string,
      ): CachedTownWeather | undefined => {
        return weatherMap.get(
          townId,
        );
      },
      [weatherMap],
    );

  /*
   * Use this when you also need
   * lastUpdated.
   */
  const getCachedWeather =
    useCallback(
      (
        townId: string,
      ):
        | CachedTownWeather
        | undefined => {
        return weatherMap.get(
          townId,
        );
      },
      [weatherMap],
    );

  const value =
    useMemo(
      () => ({
        weatherMap,
        isLoading,
        isRefreshing,
        isCacheLoaded,
        error,
        getWeather,
        getCachedWeather,
        refreshWeather,
      }),
      [
        weatherMap,
        isLoading,
        isRefreshing,
        isCacheLoaded,
        error,
        getWeather,
        getCachedWeather,
        refreshWeather,
      ],
    );

  return (
    <WeatherContext.Provider
      value={value}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather():
  WeatherContextValue {
  const context =
    useContext(
      WeatherContext,
    );

  if (!context) {
    throw new Error(
      'useWeather must be used within a WeatherProvider',
    );
  }

  return context;
}