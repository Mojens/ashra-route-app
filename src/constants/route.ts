export const ROUTE_CONFIG = {
  minimumSearchRadiusMeters: 3000,
  maximumSearchRadiusMeters: 8000,

  placesPerCategory: 4,
  maximumCandidateRoutes: 20,
  routesToTest: 4,

  nearbyPlacesCacheDurationMs: 10 * 60 * 1000,
  nearbyPlacesCacheMaximumMovementMeters: 500,
} as const;