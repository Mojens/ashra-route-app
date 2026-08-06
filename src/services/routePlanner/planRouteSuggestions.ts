import { RouteCoordinate } from "../../types/route";
import { generateRouteWithWaypoints } from "../routeService";

import {
  CandidateRoutePlan,
  PlannedRoute,
} from "./types";

interface PlanRouteSuggestionsOptions {
  origin: RouteCoordinate;
  candidates: CandidateRoutePlan[];
  targetDistanceMeters: number;
  candidateLimit?: number;
  suggestionLimit?: number;
}

export async function planRouteSuggestions({
  origin,
  candidates,
  targetDistanceMeters,
  candidateLimit = 8,
  suggestionLimit = 3,
}: PlanRouteSuggestionsOptions): Promise<PlannedRoute[]> {
  const candidatesToTest = candidates.slice(
    0,
    candidateLimit,
  );

  if (candidatesToTest.length === 0) {
    return [];
  }

  const results = await Promise.allSettled(
    candidatesToTest.map(async (candidate) => {
      const waypointCoordinates =
        candidate.waypoints.map(
          ({ place }) => place.coordinate,
        );

      const route =
        await generateRouteWithWaypoints(
          origin,
          waypointCoordinates,
        );

      const plannedRoute: PlannedRoute = {
        id: candidate.id,
        route,
        waypoints: candidate.waypoints,
        differenceMeters: Math.abs(
          targetDistanceMeters -
            route.distanceMeters,
        ),
      };

      return plannedRoute;
    }),
  );

  const successfulRoutes = results.flatMap(
    (result, index) => {
      if (result.status === "fulfilled") {
        return [result.value];
      }

      console.warn(
        `Kandidatrute ${candidatesToTest[index].id} fejlede`,
        result.reason,
      );

      return [];
    },
  );

  return successfulRoutes
    .sort(
      (first, second) =>
        first.differenceMeters -
        second.differenceMeters,
    )
    .slice(0, suggestionLimit);
}