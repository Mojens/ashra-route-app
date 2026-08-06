import { RouteCoordinate } from "../../types/route";
import { generateRouteWithWaypoints } from "../routeService";

import {
  CandidateRoutePlan,
  PlannedRoute,
} from "./types";

interface PlanBestRouteOptions {
  origin: RouteCoordinate;
  candidates: CandidateRoutePlan[];
  targetDistanceMeters: number;
  candidateLimit?: number;
}

export async function planBestRoute({
  origin,
  candidates,
  targetDistanceMeters,
  candidateLimit = 6,
}: PlanBestRouteOptions): Promise<PlannedRoute | null> {
  const candidatesToTest = candidates.slice(
    0,
    candidateLimit,
  );

  if (candidatesToTest.length === 0) {
    return null;
  }

  const results = await Promise.allSettled(
    candidatesToTest.map(async (candidate) => {
      const waypointCoordinates =
        candidate.waypoints.map(
          (waypoint) => waypoint.place.coordinate,
        );

      const route =
        await generateRouteWithWaypoints(
          origin,
          waypointCoordinates,
        );

      const plannedRoute: PlannedRoute = {
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

  if (successfulRoutes.length === 0) {
    return null;
  }

  return successfulRoutes.reduce(
    (bestRoute, currentRoute) =>
      currentRoute.differenceMeters <
      bestRoute.differenceMeters
        ? currentRoute
        : bestRoute,
  );
}