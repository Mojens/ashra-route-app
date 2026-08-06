import {
  PointOfInterest,
  RouteCoordinate,
} from "../../types/route";
import { generateRoundTripRoute } from "../routeService";
import { chooseBestCandidates } from "./chooseCandidates";
import { TestedRouteCandidate } from "./types";

interface PlanBestRouteOptions {
  origin: RouteCoordinate;
  places: PointOfInterest[];
  targetDistanceMeters: number;
  candidateLimit?: number;
}

export async function planBestRoute({
  origin,
  places,
  targetDistanceMeters,
  candidateLimit = 3,
}: PlanBestRouteOptions): Promise<TestedRouteCandidate | null> {
  const candidates = chooseBestCandidates(
    origin,
    places,
    targetDistanceMeters,
    candidateLimit,
  );

  if (candidates.length === 0) {
    return null;
  }

  const results = await Promise.allSettled(
    candidates.map(async (candidate) => {
      const route = await generateRoundTripRoute(
        origin,
        candidate.place.coordinate,
      );

      const testedCandidate: TestedRouteCandidate = {
        place: candidate.place,
        route,
        differenceMeters: Math.abs(
          targetDistanceMeters - route.distanceMeters,
        ),
      };

      return testedCandidate;
    }),
  );

  const testedCandidates = results.flatMap((result, index) => {
    if (result.status === "fulfilled") {
      return [result.value];
    }

    console.warn(
      `Kunne ikke teste ruten til ${candidates[index].place.name}`,
      result.reason,
    );

    return [];
  });

  if (testedCandidates.length === 0) {
    return null;
  }

  return testedCandidates.reduce((best, current) =>
    current.differenceMeters < best.differenceMeters
      ? current
      : best,
  );
}