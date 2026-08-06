export type RouteCategory =
  | "park"
  | "beach"
  | "supermarket";

export interface RouteFilterOption {
  id: RouteCategory;
  label: string;
  icon: string;
}

export interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

export interface GeneratedRoute {
  coordinates: RouteCoordinate[];
  distanceMeters: number;
  durationSeconds: number;
}
export interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

export interface PointOfInterest {
  id: number;
  name: string;
  category: RouteCategory;
  coordinate: RouteCoordinate;
}

export interface GeneratedRoute {
  coordinates: RouteCoordinate[];
  distanceMeters: number;
  durationSeconds: number;
  segments: RouteSegment[];
}

export interface RouteSegment {
  from: RouteCoordinate;
  to: RouteCoordinate;
  coordinates: RouteCoordinate[];
  distanceMeters: number;
  durationSeconds: number;
}