export const ROUTE_CONFIG = {
  minimumSearchRadiusMeters: 3000,
  maximumSearchRadiusMeters: 8000,

  placesPerCategory: 4,
  maximumCandidateRoutes: 20,
  routesToTest: 4,
  routeSuggestionsToShow: 3,

  nearbyPlacesCacheDurationMs: 10 * 60 * 1000,
  nearbyPlacesCacheMaximumMovementMeters: 500,

  freeRoundTrip: {
    points: 5,
    defaultSeed: 1,
  },

  openRouteService: {
    baseUrl:
      "https://api.openrouteservice.org/v2/directions",
    profile: "foot-walking",
    responseFormat: "geojson",
    timeoutMs: 20000,
  },

  overpass: {
    endpoints: [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
      "https://overpass.nchc.org.tw/api/interpreter",
    ],
    timeoutMs: 15000,
    queryTimeoutSeconds: 20,
  },

  navigation: {
    distanceIntervalMeters: 10,
    timeIntervalMs: 3000,
    waypointReachedDistanceMeters: 30,
    offRouteDistanceMeters: 60,
  },
} as const;
