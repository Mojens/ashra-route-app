// Denne fil scorer listen og vælger den bedste.
import {
  PointOfInterest,
  RouteCoordinate,
} from "../../types/route";
import { stepsToKm } from "../../utils/steps";

import { scoreDestination } from "./scoreDestination";
import { PlannedDestination } from "./types";

export function chooseBestDestination(
  origin: RouteCoordinate,
  places: PointOfInterest[],
  desiredSteps: number,
): PlannedDestination | null {
  if (places.length === 0) {
    return null;
  }

  const targetDistanceMeters =
    stepsToKm(desiredSteps) * 1000;

  const scoredDestinations = places.map((place) =>
    scoreDestination(
      origin,
      place,
      targetDistanceMeters,
    ),
  );

  const bestDestination = scoredDestinations.reduce(
    (best, current) =>
      current.differenceMeters < best.differenceMeters
        ? current
        : best,
  );

  return {
    ...bestDestination,
    targetDistanceMeters,
  };
}