import { useCallback, useMemo, useState } from "react";
import { ROUTE_CONFIG } from "../constants";
import { getLocationDescription } from "../services/geocodingService";
import {
  buildCandidateRoutes,
  GeneratedRoutePlan,
  planBestRoute,
} from "../services/routePlanner";
import {
  PointOfInterest,
  RouteCategory,
} from "../types/route";
import { stepsToKm } from "../utils/steps";

import { useNearbyPlaces } from "./useNearbyPlaces";

export function useRoutePlanner() {
  const {
    loadPlaces,
    loadingCategories,
    error: nearbyPlacesError,
  } = useNearbyPlaces();

  const [isPlanningRoute, setIsPlanningRoute] =
    useState(false);

  const isLoadingPlaces =
    loadingCategories.length > 0;

  const isBusy =
    isPlanningRoute || isLoadingPlaces;

  const generateRoutePlan = useCallback(
    async ({
      origin,
      selectedCategories,
      selectedSteps,
    }: {
      origin: {
        latitude: number;
        longitude: number;
      };
      selectedCategories: RouteCategory[];
      selectedSteps: number;
    }): Promise<GeneratedRoutePlan> => {
      if (selectedCategories.length === 0) {
        throw new Error(
          "Vælg mindst én kategori til ruten.",
        );
      }

      setIsPlanningRoute(true);

      try {
        const targetDistanceMeters =
          stepsToKm(selectedSteps) * 1000;

        const searchRadiusMeters =
          calculateSearchRadius(
            targetDistanceMeters,
          );

        const categoryResults =
          await Promise.all(
            selectedCategories.map(
              async (category) => {
                const places = await loadPlaces(
                  origin,
                  category,
                  searchRadiusMeters,
                );

                return [category, places] as const;
              },
            ),
          );

        const placesByCategory =
          Object.fromEntries(
            categoryResults,
          ) as Partial<
            Record<
              RouteCategory,
              PointOfInterest[]
            >
          >;

        validateCategoryResults(
          selectedCategories,
          placesByCategory,
          searchRadiusMeters,
        );

        const candidateRoutes =
          buildCandidateRoutes({
            selectedCategories,
            placesByCategory,
            placesPerCategory:
              ROUTE_CONFIG.placesPerCategory,
            maximumRoutes:
              ROUTE_CONFIG.maximumCandidateRoutes,
          });

        if (candidateRoutes.length === 0) {
          throw new Error(
            "Der kunne ikke bygges nogen mulige ruter med dine valg.",
          );
        }

        const plannedRoute =
          await planBestRoute({
            origin,
            candidates: candidateRoutes,
            targetDistanceMeters,
            candidateLimit:
              ROUTE_CONFIG.routesToTest,
          });

        if (!plannedRoute) {
          throw new Error(
            "Der kunne ikke genereres en passende rute.",
          );
        }

        const namedWaypoints =
          await addWaypointFallbackNames(
            plannedRoute.waypoints,
          );

        return {
          route: plannedRoute.route,
          waypoints: namedWaypoints,
          targetDistanceMeters,
          differenceMeters:
            plannedRoute.differenceMeters,
        };
      } finally {
        setIsPlanningRoute(false);
      }
    },
    [loadPlaces],
  );

  const errorMessage = useMemo(
    () => nearbyPlacesError,
    [nearbyPlacesError],
  );

  return {
    generateRoutePlan,
    isBusy,
    errorMessage,
  };
}

function calculateSearchRadius(
  targetDistanceMeters: number,
): number {
  return Math.min(
    ROUTE_CONFIG.maximumSearchRadiusMeters,
    Math.max(
      ROUTE_CONFIG.minimumSearchRadiusMeters,
      Math.ceil(targetDistanceMeters / 2),
    ),
  );
}

function validateCategoryResults(
  selectedCategories: RouteCategory[],
  placesByCategory: Partial<
    Record<RouteCategory, PointOfInterest[]>
  >,
  searchRadiusMeters: number,
): void {
  const missingCategories =
    selectedCategories.filter(
      (category) =>
        !placesByCategory[category]?.length,
    );

  if (missingCategories.length === 0) {
    return;
  }

  const categoryNames =
    missingCategories
      .map(getCategoryLabel)
      .join(", ");

  throw new Error(
    `Vi kunne ikke finde ${categoryNames} inden for ${(
      searchRadiusMeters / 1000
    ).toFixed(1)} km.`,
  );
}

async function addWaypointFallbackNames(
  waypoints: GeneratedRoutePlan["waypoints"],
): Promise<GeneratedRoutePlan["waypoints"]> {
  return Promise.all(
    waypoints.map(async (waypoint) => {
      if (!isFallbackName(waypoint.place)) {
        return waypoint;
      }

      const description =
        await getLocationDescription(
          waypoint.place.coordinate,
        );

      if (!description) {
        return waypoint;
      }

      return {
        ...waypoint,
        place: {
          ...waypoint.place,
          name: description,
        },
      };
    }),
  );
}

function isFallbackName(
  place: PointOfInterest,
): boolean {
  const fallbackNames = [
    "Park",
    "Strand",
    "Supermarked",
  ];

  return fallbackNames.includes(place.name);
}

function getCategoryLabel(
  category: RouteCategory,
): string {
  switch (category) {
    case "park":
      return "en park";

    case "beach":
      return "en strand";

    case "supermarket":
      return "et supermarked";
  }
}