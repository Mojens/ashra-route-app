export type RouteCategory =
  | "park"
  | "beach"
  | "supermarket"
  | "cafe"
  | "restaurant"
  | "bakery"
  | "pharmacy"
  | "playground"
  | "museum"
  | "library"
  | "cinema"
  | "fitness"
  | "shoppingMall"
  | "viewpoint";
  
export interface RouteCategoryOption {
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