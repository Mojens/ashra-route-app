import {
  GeneratedRoute,
  PointOfInterest,
  RouteCategory,
  RouteCoordinate,
} from "../../types/route";

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

export interface GenerateRoutePlanOptions {
  origin: RouteCoordinate;
  selectedCategories: RouteCategory[];
  selectedSteps: number;
}

export interface GeneratedRoutePlan {
  route: GeneratedRoute;
  waypoints: RouteWaypoint[];
  targetDistanceMeters: number;
  differenceMeters: number;
}