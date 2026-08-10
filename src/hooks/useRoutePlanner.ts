import { useCallback, useMemo, useState } from "react";
import {
  CATEGORY_LABELS,
  ROUTE_CATEGORIES,
  ROUTE_CONFIG,
} from "../constants";
import { getLocationDescription } from "../services/geocodingService";
import {
  buildCandidateRoutes,
  GeneratedRoutePlan,
  planRouteSuggestions,
} from "../services/routePlanner";
import {
  PointOfInterest,
  RouteCategory,
  RouteCoordinate,
} from "../types/route";
import { stepsToKm } from "../utils/steps";
import { generateFreeRoundTripRoute } from "../services/routeService";
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

  const generateRoutePlans = useCallback(
    async ({
      origin,
      selectedCategories,
      selectedSteps,
    }: {
      origin: RouteCoordinate;
      selectedCategories: RouteCategory[];
      selectedSteps: number;
    }): Promise<GeneratedRoutePlan[]> => {
      setIsPlanningRoute(true);

      try {
        const targetDistanceMeters =
          stepsToKm(selectedSteps) * 1000;

        /*
         * Ingen kategorier:
         * Returnér én almindelig rundtur.
         */
        if (selectedCategories.length === 0) {
          const route =
            await generateFreeRoundTripRoute(
              origin,
              targetDistanceMeters,
            );

          return [
            {
              id: "free-round-trip",
              route,
              waypoints: [],
              targetDistanceMeters,
              differenceMeters: Math.abs(
                targetDistanceMeters -
                route.distanceMeters,
              ),
            },
          ];
        }

        /*
         * Kategorier valgt:
         * Hent POI'er og lav flere ruteforslag.
         */
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

        const suggestions =
          await planRouteSuggestions({
            origin,
            candidates: candidateRoutes,
            targetDistanceMeters,
            candidateLimit:
              ROUTE_CONFIG.routesToTest,
            suggestionLimit:
              ROUTE_CONFIG.routeSuggestionsToShow,
          });

        if (suggestions.length === 0) {
          throw new Error(
            "Der kunne ikke genereres nogen passende ruter.",
          );
        }

        return Promise.all(
          suggestions.map(async (suggestion) => {
            const namedWaypoints =
              await addWaypointFallbackNames(
                suggestion.waypoints,
              );

            return {
              id: suggestion.id,
              route: suggestion.route,
              waypoints: namedWaypoints,
              targetDistanceMeters,
              differenceMeters:
                suggestion.differenceMeters,
            };
          }),
        );
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
    generateRoutePlans,
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
    `Vi kunne ikke finde følgende steder i området: ${categoryNames}.`,
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
          waypoint.place.category,
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

function isFallbackName(place: PointOfInterest): boolean {
  const fallbackNames =
    ROUTE_CATEGORIES.map(
      (category) => category.label,
    );

  return fallbackNames.includes(
    place.name,
  );
}

function getCategoryLabel(category: RouteCategory): string {
  return CATEGORY_LABELS[category];
}