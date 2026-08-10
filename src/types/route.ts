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
  | "viewpoint"
  | "fastFood"
  | "iceCream"
  | "bar"
  | "pub"
  | "convenience"
  | "clothes"
  | "books"
  | "sportsShop"
  | "gardenCentre"
  | "forest"
  | "natureReserve"
  | "picnicSite"
  | "dogPark"
  | "sportsCentre"
  | "swimmingPool"
  | "stadium"
  | "attraction"
  | "monument"
  | "artwork"
  | "gallery"
  | "zoo"
  | "castle"
  | "toilets"
  | "drinkingWater";

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