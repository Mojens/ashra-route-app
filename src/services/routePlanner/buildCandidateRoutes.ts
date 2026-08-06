import {
  PointOfInterest,
  RouteCategory,
} from "../../types/route";

import {
  CandidateRoutePlan,
  RouteWaypoint,
} from "./types";

export type PlacesByCategory = Partial<
  Record<RouteCategory, PointOfInterest[]>
>;

interface BuildCandidateRoutesOptions {
  selectedCategories: RouteCategory[];
  placesByCategory: PlacesByCategory;
  placesPerCategory?: number;
  maximumRoutes?: number;
}

export function buildCandidateRoutes({
  selectedCategories,
  placesByCategory,
  placesPerCategory = 3,
  maximumRoutes = 20,
}: BuildCandidateRoutesOptions): CandidateRoutePlan[] {
  if (selectedCategories.length === 0) {
    return [];
  }

  const waypointGroups = selectedCategories.map(
    (category): RouteWaypoint[] => {
      const places =
        placesByCategory[category]?.slice(
          0,
          placesPerCategory,
        ) ?? [];

      return places.map((place) => ({
        place,
        category,
      }));
    },
  );

  // Alle valgte kategorier skal have mindst ét sted.
  if (waypointGroups.some((group) => group.length === 0)) {
    return [];
  }

  const combinations = createCombinations(waypointGroups);

  const routes = combinations.flatMap((combination) =>
    createPermutations(combination),
  );

  return removeDuplicateRoutes(routes)
    .slice(0, maximumRoutes)
    .map((waypoints) => ({
      id: createRouteId(waypoints),
      waypoints,
    }));
}

function createCombinations(
  groups: RouteWaypoint[][],
  groupIndex = 0,
  current: RouteWaypoint[] = [],
): RouteWaypoint[][] {
  if (groupIndex === groups.length) {
    return [current];
  }

  return groups[groupIndex].flatMap((waypoint) =>
    createCombinations(
      groups,
      groupIndex + 1,
      [...current, waypoint],
    ),
  );
}

function createPermutations(
  waypoints: RouteWaypoint[],
): RouteWaypoint[][] {
  if (waypoints.length <= 1) {
    return [waypoints];
  }

  return waypoints.flatMap((waypoint, index) => {
    const remaining = waypoints.filter(
      (_, currentIndex) => currentIndex !== index,
    );

    return createPermutations(remaining).map(
      (permutation) => [
        waypoint,
        ...permutation,
      ],
    );
  });
}

function removeDuplicateRoutes(
  routes: RouteWaypoint[][],
): RouteWaypoint[][] {
  const uniqueRoutes = new Map<
    string,
    RouteWaypoint[]
  >();

  routes.forEach((route) => {
    const id = createRouteId(route);

    if (!uniqueRoutes.has(id)) {
      uniqueRoutes.set(id, route);
    }
  });

  return Array.from(uniqueRoutes.values());
}

function createRouteId(
  waypoints: RouteWaypoint[],
): string {
  return waypoints
    .map(
      (waypoint) =>
        `${waypoint.category}-${waypoint.place.id}`,
    )
    .join("__");
}