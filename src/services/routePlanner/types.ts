import {
  GeneratedRoute,
  PointOfInterest,
  RouteCategory,
} from "../../types/route";

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

export interface TestedRouteCandidate {
  place: PointOfInterest;
  route: GeneratedRoute;
  differenceMeters: number;
}

export interface RouteWaypoint {
  place: PointOfInterest;
  category: RouteCategory;
}

export interface CandidateRoutePlan {
  id: string;
  waypoints: RouteWaypoint[];
}

export interface PlannedRoute {
  route: GeneratedRoute;
  waypoints: RouteWaypoint[];
  differenceMeters: number;
}