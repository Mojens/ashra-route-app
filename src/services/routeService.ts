import axios from "axios";

import {
  GeneratedRoute,
  RouteCoordinate,
} from "../types/route";

interface OpenRouteServiceResponse {
  features: Array<{
    geometry: {
      coordinates: [number, number][];
    };
    properties: {
      summary: {
        distance: number;
        duration: number;
      };
    };
  }>;
}

const API_URL =
  "https://api.openrouteservice.org/v2/directions/foot-walking/geojson";

export async function generateRouteWithWaypoints(
  start: RouteCoordinate,
  waypoints: RouteCoordinate[],
): Promise<GeneratedRoute> {
  const apiKey = process.env.EXPO_PUBLIC_ORS_API_KEY;

  if (!apiKey) {
    throw new Error("OpenRouteService API-nøglen mangler.");
  }

  const coordinates = [
    start,
    ...waypoints,
    start,
  ].map((coordinate) => [
    coordinate.longitude,
    coordinate.latitude,
  ]);

  const response = await axios.post<OpenRouteServiceResponse>(
    API_URL,
    {
      coordinates,
    },
    {
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      timeout: 20000,
    },
  );

  const feature = response.data.features[0];

  if (!feature) {
    throw new Error(
      "OpenRouteService returnerede ingen rute.",
    );
  }

  return {
    coordinates: feature.geometry.coordinates.map(
      ([longitude, latitude]) => ({
        latitude,
        longitude,
      }),
    ),
    distanceMeters:
      feature.properties.summary.distance,
    durationSeconds:
      feature.properties.summary.duration,
  };
}

export async function generateRoundTripRoute(
  start: RouteCoordinate,
  waypoint: RouteCoordinate,
): Promise<GeneratedRoute> {
  return generateRouteWithWaypoints(start, [waypoint]);
}