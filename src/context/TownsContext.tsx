// src/context/TownsContext.tsx

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { loadTowns, saveTowns } from '../storage/townStorage';

import type { Station } from '../types/station';

interface TownsContextValue {
  towns: Station[];
  isLoading: boolean;
  error: string | null;

  addTown: (town: Station) => void;
  removeTown: (townId: string) => void;
  hasTown: (townId: string) => boolean;
  getTown: (townId: string) => Station | undefined;
  clearTowns: () => void;
}

const TownsContext = createContext<TownsContextValue | undefined>(undefined);

export function TownsProvider({ children }: PropsWithChildren) {
  //////////////////////////
  // VARIABLES
  //////////////////////////

  const [townsMap, setTownsMap] = useState<Map<string, Station>>(
    () => new Map(),
  );

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const towns = useMemo(() => {
    return Array.from(townsMap.values());
  }, [townsMap]);

  //////////////////////////
  // EFFECTS
  //////////////////////////

  useEffect(() => {
    async function initializeTowns() {
      try {
        const storedTowns = await loadTowns();

        setTownsMap(new Map(storedTowns.map(town => [town.id, town])));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load towns');
      } finally {
        setIsLoading(false);
      }
    }

    initializeTowns();
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    async function save() {
      try {
        await saveTowns(Array.from(townsMap.values()));
      } catch (err) {
        console.error('Unable to save towns:', err);
      }
    }

    save();
  }, [townsMap, isLoading]);

  //////////////////////////
  // ACTIONS
  //////////////////////////

  const addTown = useCallback((town: Station) => {
    setTownsMap(current => {
      if (current.has(town.id)) {
        return current;
      }

      const updated = new Map(current);

      updated.set(town.id, town);

      return updated;
    });
  }, []);

  const removeTown = useCallback((townId: string) => {
    setTownsMap(current => {
      if (!current.has(townId)) {
        return current;
      }

      const updated = new Map(current);

      updated.delete(townId);

      return updated;
    });
  }, []);

  const hasTown = useCallback(
    (townId: string) => {
      return townsMap.has(townId);
    },
    [townsMap],
  );

  const getTown = useCallback(
    (townId: string) => {
      return townsMap.get(townId);
    },
    [townsMap],
  );

  const clearTowns = useCallback(() => {
    setTownsMap(new Map());
  }, []);

  //////////////////////////
  // PROVIDER
  //////////////////////////

  const value = useMemo(
    () => ({
      towns,
      isLoading,
      error,
      addTown,
      removeTown,
      hasTown,
      getTown,
      clearTowns,
    }),
    [
      towns,
      isLoading,
      error,
      addTown,
      removeTown,
      hasTown,
      getTown,
      clearTowns,
    ],
  );

  return (
    <TownsContext.Provider value={value}>{children}</TownsContext.Provider>
  );
}

//////////////////////////
// HOOK
//////////////////////////

export function useTowns(): TownsContextValue {
  const context = useContext(TownsContext);

  if (!context) {
    throw new Error('useTowns must be used within a TownsProvider');
  }

  return context;
}
