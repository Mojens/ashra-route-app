import { useCallback, useRef, useState } from "react";

import { findNearbyPlaces } from "../services/overpassService";
import {
  PointOfInterest,
  RouteCategory,
  RouteCoordinate,
} from "../types/route";

type PlacesByCategory = Partial<
  Record<RouteCategory, PointOfInterest[]>
>;

interface CacheEntry {
  places: PointOfInterest[];
  fetchedAt: number;
  origin: RouteCoordinate;
}

type PlacesCache = Partial<
  Record<RouteCategory, CacheEntry>
>;

const CACHE_DURATION_MS = 10 * 60 * 1000;
const CACHE_MAX_MOVEMENT_METERS = 500;

export function useNearbyPlaces() {
  const cacheRef = useRef<PlacesCache>({});

  const [placesByCategory, setPlacesByCategory] =
    useState<PlacesByCategory>({});

  const [loadingCategories, setLoadingCategories] = useState<
    RouteCategory[]
  >([]);

  const [error, setError] = useState<string | null>(null);

  const loadPlaces = useCallback(
    async (
      origin: RouteCoordinate,
      category: RouteCategory,
      radiusMeters = 3000,
    ): Promise<PointOfInterest[]> => {
      const cachedEntry = cacheRef.current[category];

      if (isCacheEntryValid(cachedEntry, origin)) {
        return cachedEntry.places;
      }

      setLoadingCategories((current) =>
        current.includes(category)
          ? current
          : [...current, category],
      );

      setError(null);

      try {
        const places = await findNearbyPlaces(
          origin,
          category,
          radiusMeters,
        );

        cacheRef.current[category] = {
          places,
          origin,
          fetchedAt: Date.now(),
        };

        setPlacesByCategory((current) => ({
          ...current,
          [category]: places,
        }));

        return places;
      } catch (caughtError) {
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "Nærliggende steder kunne ikke hentes.";

        setError(message);
        throw caughtError;
      } finally {
        setLoadingCategories((current) =>
          current.filter(
            (loadingCategory) =>
              loadingCategory !== category,
          ),
        );
      }
    },
    [],
  );

  const getPlaces = useCallback(
    (category: RouteCategory) =>
      placesByCategory[category] ?? [],
    [placesByCategory],
  );

  const clearCache = useCallback(() => {
    cacheRef.current = {};
    setPlacesByCategory({});
  }, []);

  return {
    loadPlaces,
    getPlaces,
    clearCache,
    loadingCategories,
    error,
  };
}

function isCacheEntryValid(
  entry: CacheEntry | undefined,
  currentOrigin: RouteCoordinate,
): entry is CacheEntry {
  if (!entry) {
    return false;
  }

  const cacheAge = Date.now() - entry.fetchedAt;

  if (cacheAge > CACHE_DURATION_MS) {
    return false;
  }

  return (
    calculateApproximateDistanceMeters(
      entry.origin,
      currentOrigin,
    ) <= CACHE_MAX_MOVEMENT_METERS
  );
}

function calculateApproximateDistanceMeters(
  first: RouteCoordinate,
  second: RouteCoordinate,
): number {
  const latitudeMeters =
    (second.latitude - first.latitude) * 111_320;

  const averageLatitude =
    ((first.latitude + second.latitude) / 2) *
    (Math.PI / 180);

  const longitudeMeters =
    (second.longitude - first.longitude) *
    111_320 *
    Math.cos(averageLatitude);

  return Math.sqrt(
    latitudeMeters ** 2 + longitudeMeters ** 2,
  );
}