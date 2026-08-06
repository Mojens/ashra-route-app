import axios, { AxiosError } from "axios";

import {
  PointOfInterest,
  RouteCategory,
  RouteCoordinate,
} from "../types/route";
import { calculateDistanceMeters } from "../utils/distance";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.nchc.org.tw/api/interpreter",
];

interface OverpassElement {
  id: number;
  type: "node" | "way" | "relation";
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: {
    name?: string;
  };
}

interface OverpassResponse {
  elements: OverpassElement[];
}

const CATEGORY_QUERIES: Record<RouteCategory, string> = {
  park: '["leisure"="park"]',
  beach: '["natural"="beach"]',
  supermarket: '["shop"="supermarket"]',
};

async function executeOverpassQuery(
  query: string,
): Promise<OverpassResponse> {
  let lastError: unknown;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await axios.post<OverpassResponse>(
        endpoint,
        query,
        {
          headers: {
            "Content-Type": "text/plain",
          },
          timeout: 15000,
        },
      );

      return response.data;
    } catch (error) {
      lastError = error;

      const status =
        error instanceof AxiosError
          ? error.response?.status
          : undefined;

      console.warn(
        `Overpass fejlede på ${endpoint}`,
        status ?? "ingen statuskode",
      );

      const shouldTryNextEndpoint =
        status === 429 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        status === undefined;

      if (!shouldTryNextEndpoint) {
        throw error;
      }
    }
  }

  throw new Error(
    "Korttjenesten er midlertidigt overbelastet. Prøv igen om lidt.",
    {
      cause: lastError,
    },
  );
}

export async function findNearbyPlaces(
  start: RouteCoordinate,
  category: RouteCategory,
  radiusMeters = 3000,
): Promise<PointOfInterest[]> {
  const categoryQuery = CATEGORY_QUERIES[category];

  const query = `
    [out:json][timeout:20];
    (
      node${categoryQuery}(around:${radiusMeters},${start.latitude},${start.longitude});
      way${categoryQuery}(around:${radiusMeters},${start.latitude},${start.longitude});
      relation${categoryQuery}(around:${radiusMeters},${start.latitude},${start.longitude});
    );
    out center tags;
  `;

  const data = await executeOverpassQuery(query);

  return data.elements
    .map((element): PointOfInterest | null => {
      const latitude = element.lat ?? element.center?.lat;
      const longitude = element.lon ?? element.center?.lon;

      if (
        latitude === undefined ||
        longitude === undefined
      ) {
        return null;
      }

      return {
        id: element.id,
        name:
          element.tags?.name ??
          getFallbackName(category),
        category,
        coordinate: {
          latitude,
          longitude,
        },
      };
    })
    .filter(
      (place): place is PointOfInterest =>
        place !== null,
    );
}

export async function findNearestPlace(
  start: RouteCoordinate,
  category: RouteCategory,
  radiusMeters = 3000,
): Promise<PointOfInterest | null> {
  const places = await findNearbyPlaces(
    start,
    category,
    radiusMeters,
  );

  if (places.length === 0) {
    return null;
  }

  return places.reduce((nearest, current) => {
    const nearestDistance = calculateDistanceMeters(
      start,
      nearest.coordinate,
    );

    const currentDistance = calculateDistanceMeters(
      start,
      current.coordinate,
    );

    return currentDistance < nearestDistance
      ? current
      : nearest;
  });
}

function getFallbackName(
  category: RouteCategory,
): string {
  switch (category) {
    case "park":
      return "Unavngiven park";

    case "beach":
      return "Unavngiven strand";

    case "supermarket":
      return "Supermarked";
  }
}