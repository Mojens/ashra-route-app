import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import { ROUTE_CONFIG } from "../constants";
import { RouteCoordinate, RouteSegment } from "../types/route";
import { calculateDistanceToRouteMeters, calculateDistanceMeters } from "../utils/distance";

interface UseActiveRouteNavigationOptions {
  isActive: boolean;
  currentStopIndex: number;
  segments: RouteSegment[];
  onDestinationReached: () => void;
}

export function useActiveRouteNavigation({
  isActive,
  currentStopIndex,
  segments,
  onDestinationReached,
}: UseActiveRouteNavigationOptions) {
  const [distanceFromRouteMeters, setDistanceFromRouteMeters] = useState<number | null>(null);

  const [isOffRoute, setIsOffRoute] = useState(false);

  const hasReachedCurrentDestinationRef =
    useRef(false);

  const [currentPosition, setCurrentPosition] =
    useState<RouteCoordinate | null>(null);

  const [
    distanceToNextStopMeters,
    setDistanceToNextStopMeters,
  ] = useState<number | null>(null);

  const [locationError, setLocationError] =
    useState<string | null>(null);

  const [heading, setHeading] =
    useState<number | null>(null);

  useEffect(() => {
    hasReachedCurrentDestinationRef.current = false;
  }, [currentStopIndex]);

  useEffect(() => {
    if (!isActive) {
      setDistanceFromRouteMeters(null);
      setIsOffRoute(false);
      setHeading(null);
      return;
    }

    let subscription:
      | Location.LocationSubscription
      | null = null;

    let cancelled = false;

    const startWatchingHeading = async () => {
      try {
        subscription =
          await Location.watchHeadingAsync(
            (headingData) => {
              if (cancelled) {
                return;
              }

              const nextHeading =
                headingData.trueHeading >= 0
                  ? headingData.trueHeading
                  : headingData.magHeading;

              setHeading(nextHeading);
            },
          );
      } catch (error) {
        console.error(
          "Kunne ikke hente retning:",
          error,
        );
      }
    };

    void startWatchingHeading();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [isActive]);

  useEffect(() => {
    if (!isActive) {
      setCurrentPosition(null);
      setDistanceToNextStopMeters(null);
      setLocationError(null);
      return;
    }

    const currentSegment =
      segments[currentStopIndex];

    if (!currentSegment) {
      return;
    }

    let subscription:
      | Location.LocationSubscription
      | null = null;

    let cancelled = false;

    const startWatching = async () => {
      try {
        setLocationError(null);

        const permission =
          await Location.getForegroundPermissionsAsync();

        if (permission.status !== "granted") {
          const requested =
            await Location.requestForegroundPermissionsAsync();

          if (requested.status !== "granted") {
            throw new Error(
              "Appen skal have adgang til din lokation.",
            );
          }
        }

        subscription =
          await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              distanceInterval:
                ROUTE_CONFIG.navigation
                  .distanceIntervalMeters,
              timeInterval:
                ROUTE_CONFIG.navigation
                  .timeIntervalMs,
            },
            (location) => {
              if (cancelled) {
                return;
              }

              const position: RouteCoordinate = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              };

              setCurrentPosition(position);

              const distance =
                calculateDistanceMeters(
                  position,
                  currentSegment.to,
                );

              setDistanceToNextStopMeters(distance);

              const distanceFromRoute =
                calculateDistanceToRouteMeters(
                  position,
                  currentSegment.coordinates,
                );

              setDistanceFromRouteMeters(
                distanceFromRoute,
              );

              const offRoute =
                distanceFromRoute !== null &&
                distanceFromRoute >
                ROUTE_CONFIG.navigation
                  .offRouteDistanceMeters;

              setIsOffRoute(offRoute);

              const hasReachedDestination =
                distance <=
                ROUTE_CONFIG.navigation
                  .waypointReachedDistanceMeters;

              if (
                hasReachedDestination &&
                !hasReachedCurrentDestinationRef.current
              ) {
                hasReachedCurrentDestinationRef.current =
                  true;

                onDestinationReached();
              }
            },
          );
      } catch (error) {
        console.error(
          "Kunne ikke følge position:",
          error,
        );

        if (!cancelled) {
          setLocationError(
            error instanceof Error
              ? error.message
              : "Din position kunne ikke opdateres.",
          );
        }
      }
    };

    void startWatching();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [
    isActive,
    currentStopIndex,
    segments,
    onDestinationReached,
  ]);

  return {
    currentPosition,
    distanceToNextStopMeters,
    distanceFromRouteMeters,
    isOffRoute,
    locationError,
    heading,
  };
}