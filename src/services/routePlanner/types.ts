import { PointOfInterest } from "../../types/route";

export interface PlannedDestination {
  place: PointOfInterest;
  targetDistanceMeters: number;
  estimatedRoundTripMeters: number;
  differenceMeters: number;
}

export interface ScoredDestination {
  place: PointOfInterest;
  estimatedRoundTripMeters: number;
  differenceMeters: number;
}