// Denne fil har kun ansvar for at vurdere én destination.
import {
  PointOfInterest,
  RouteCoordinate,
} from "../../types/route";
import { calculateDistanceMeters } from "../../utils/distance";

import { ScoredDestination } from "./types";

export function scoreDestination(
  origin: RouteCoordinate,
  place: PointOfInterest,
  targetDistanceMeters: number,
): ScoredDestination {
  const directDistanceMeters = calculateDistanceMeters(
    origin,
    place.coordinate,
  );

  const estimatedRoundTripMeters =
    directDistanceMeters * 2;

  const differenceMeters = Math.abs(
    targetDistanceMeters - estimatedRoundTripMeters,
  );

  return {
    place,
    estimatedRoundTripMeters,
    differenceMeters,
  };
}