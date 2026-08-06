import {
  PointOfInterest,
  RouteCoordinate,
} from "../../types/route";
import { scoreDestination } from "./scoreDestination";
import { ScoredDestination } from "./types";

export function chooseBestCandidates(
  origin: RouteCoordinate,
  places: PointOfInterest[],
  targetDistanceMeters: number,
  limit = 5,
): ScoredDestination[] {
  return places
    .map((place) =>
      scoreDestination(
        origin,
        place,
        targetDistanceMeters,
      ),
    )
    .sort(
      (first, second) =>
        first.differenceMeters -
        second.differenceMeters,
    )
    .slice(0, limit);
}