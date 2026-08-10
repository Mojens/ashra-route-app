import axios from "axios";

import { ROUTE_CONFIG } from "../constants";
import {
  GeneratedRoute,
  RouteCoordinate,
  RouteSegment,
} from "../types/route";

interface OpenRouteServiceSegment {
  distance: number;
  duration: number;
}

interface OpenRouteServiceFeature {
  geometry: {
    coordinates: [number, number][];
  };
  properties: {
    summary: {
      distance: number;
      duration: number;
    };
    segments?: OpenRouteServiceSegment[];
    way_points?: number[];
  };
}

interface OpenRouteServiceResponse {
  features: OpenRouteServiceFeature[];
}

const {
  baseUrl,
  profile,
  responseFormat,
  timeoutMs,
} = ROUTE_CONFIG.openRouteService;

const API_URL =
  `${baseUrl}/${profile}/${responseFormat}`;

export async function generateRouteWithWaypoints(
  start: RouteCoordinate,
  waypoints: RouteCoordinate[],
): Promise<GeneratedRoute> {
  const apiKey =
    process.env.EXPO_PUBLIC_ORS_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OpenRouteService API-nøglen mangler.",
    );
  }

  const requestedCoordinates = [
    start,
    ...waypoints,
    start,
  ];

  const response =
    await axios.post<OpenRouteServiceResponse>(
      API_URL,
      {
        coordinates: requestedCoordinates.map(
          ({ longitude, latitude }) => [
            longitude,
            latitude,
          ],
        ),
      },
      {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        timeout: timeoutMs,
      },
    );

  const feature = response.data.features[0];

  if (!feature) {
    throw new Error(
      "OpenRouteService returnerede ingen rute.",
    );
  }

  const routeCoordinates =
    feature.geometry.coordinates.map(
      ([longitude, latitude]) => ({
        latitude,
        longitude,
      }),
    );

  const segments = createRouteSegments(
    requestedCoordinates,
    routeCoordinates,
    feature.properties.segments ?? [],
    feature.properties.way_points ?? [],
  );

  return {
    coordinates: routeCoordinates,
    distanceMeters:
      feature.properties.summary.distance,
    durationSeconds:
      feature.properties.summary.duration,
    segments,
  };
}

function createRouteSegments(
  requestedCoordinates: RouteCoordinate[],
  routeCoordinates: RouteCoordinate[],
  apiSegments: OpenRouteServiceSegment[],
  wayPointIndexes: number[],
): RouteSegment[] {
  if (
    apiSegments.length === 0 ||
    wayPointIndexes.length < 2
  ) {
    return [];
  }

  return apiSegments.map((segment, index) => {
    const startIndex =
      wayPointIndexes[index];

    const endIndex =
      wayPointIndexes[index + 1];

    if (
      startIndex === undefined ||
      endIndex === undefined
    ) {
      throw new Error(
        "OpenRouteService returnerede ugyldige waypoint-indekser.",
      );
    }

    return {
      from: requestedCoordinates[index],
      to: requestedCoordinates[index + 1],
      coordinates: routeCoordinates.slice(
        startIndex,
        endIndex + 1,
      ),
      distanceMeters: segment.distance,
      durationSeconds: segment.duration,
    };
  });
}

export async function generateRoundTripRoute(
  start: RouteCoordinate,
  waypoint: RouteCoordinate,
): Promise<GeneratedRoute> {
  return generateRouteWithWaypoints(
    start,
    [waypoint],
  );
}

export async function generateFreeRoundTripRoute(
  origin: RouteCoordinate,
  targetDistanceMeters: number,
  seed = ROUTE_CONFIG.freeRoundTrip.defaultSeed,
): Promise<GeneratedRoute> {
  const apiKey =
    process.env.EXPO_PUBLIC_ORS_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OpenRouteService API-nøglen mangler.",
    );
  }

  const response =
    await axios.post<OpenRouteServiceResponse>(
      API_URL,
      {
        coordinates: [
          [
            origin.longitude,
            origin.latitude,
          ],
        ],
        options: {
          round_trip: {
            length: targetDistanceMeters,
            points:
              ROUTE_CONFIG.freeRoundTrip.points,
            seed,
          },
        },
      },
      {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        timeout:
          ROUTE_CONFIG.openRouteService.timeoutMs,
      },
    );

  const feature = response.data.features[0];

  if (!feature) {
    throw new Error(
      "OpenRouteService returnerede ingen rundtur.",
    );
  }

  const routeCoordinates =
    feature.geometry.coordinates.map(
      ([longitude, latitude]) => ({
        latitude,
        longitude,
      }),
    );

  return {
    coordinates: routeCoordinates,
    distanceMeters:
      feature.properties.summary.distance,
    durationSeconds:
      feature.properties.summary.duration,
    segments: [],
  };
}

export async function generateRouteFromPosition(
  start: RouteCoordinate,
  destinations: RouteCoordinate[],
): Promise<GeneratedRoute> {
  const apiKey =
    process.env.EXPO_PUBLIC_ORS_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OpenRouteService API-nøglen mangler.",
    );
  }

  if (destinations.length === 0) {
    throw new Error(
      "Der mangler en destination.",
    );
  }

  const requestedCoordinates = [
    start,
    ...destinations,
  ];

  const response =
    await axios.post<OpenRouteServiceResponse>(
      API_URL,
      {
        coordinates: requestedCoordinates.map(
          ({ longitude, latitude }) => [
            longitude,
            latitude,
          ],
        ),
      },
      {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        timeout:
          ROUTE_CONFIG.openRouteService.timeoutMs,
      },
    );

  const feature = response.data.features[0];

  if (!feature) {
    throw new Error(
      "OpenRouteService returnerede ingen rute.",
    );
  }

  const routeCoordinates =
    feature.geometry.coordinates.map(
      ([longitude, latitude]) => ({
        latitude,
        longitude,
      }),
    );

  const segments = createRouteSegments(
    requestedCoordinates,
    routeCoordinates,
    feature.properties.segments ?? [],
    feature.properties.way_points ?? [],
  );

  return {
    coordinates: routeCoordinates,
    distanceMeters:
      feature.properties.summary.distance,
    durationSeconds:
      feature.properties.summary.duration,
    segments,
  };
}