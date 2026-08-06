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
  candidateLimit = 5,
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

  const testedCandidates: TestedRouteCandidate[] = [];

  for (const candidate of candidates) {
    try {
      const route = await generateRoundTripRoute(
        origin,
        candidate.place.coordinate,
      );

      testedCandidates.push({
        place: candidate.place,
        route,
        differenceMeters: Math.abs(
          targetDistanceMeters - route.distanceMeters,
        ),
      });
    } catch (error) {
      console.warn(
        `Kunne ikke teste ruten til ${candidate.place.name}`,
        error,
      );
    }
  }

  if (testedCandidates.length === 0) {
    return null;
  }

  return testedCandidates.reduce((best, current) =>
    current.differenceMeters < best.differenceMeters
      ? current
      : best,
  );
}