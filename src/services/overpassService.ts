import axios, { AxiosError } from "axios";

import {
  ROUTE_CATEGORIES,
  ROUTE_CONFIG,
} from "../constants";
import {
  PointOfInterest,
  RouteCategory,
  RouteCoordinate,
} from "../types/route";
import { calculateDistanceMeters } from "../utils/distance";

const OVERPASS_ENDPOINTS =
  ROUTE_CONFIG.overpass.endpoints;

interface OverpassElement {
  id: number;
  type: "node" | "way" | "relation";

  lat?: number;
  lon?: number;

  center?: {
    lat: number;
    lon: number;
  };

  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

function getCategoryConfig(
  category: RouteCategory,
) {
  const categoryConfig =
    ROUTE_CATEGORIES.find(
      (item) => item.id === category,
    );

  if (!categoryConfig) {
    throw new Error(
      `Ukendt kategori: ${category}`,
    );
  }

  return categoryConfig;
}

function getPlaceName(
  element: OverpassElement,
  category: RouteCategory,
): string {
  const tags = element.tags;

  const name =
    tags?.["name:da"]?.trim() ||
    tags?.name?.trim() ||
    tags?.official_name?.trim() ||
    tags?.short_name?.trim() ||
    tags?.alt_name?.trim() ||
    tags?.brand?.trim() ||
    tags?.operator?.trim();

  if (name) {
    return name;
  }

  return getFallbackName(category);
}

async function executeOverpassQuery(
  query: string,
): Promise<OverpassResponse> {
  let lastError: unknown;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response =
        await axios.post<OverpassResponse>(
          endpoint,
          query,
          {
            headers: {
              "Content-Type": "text/plain",
            },
            timeout:
              ROUTE_CONFIG.overpass.timeoutMs,
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
  const categoryConfig =
    getCategoryConfig(category);

  const {
    key,
    value,
  } = categoryConfig.osm;

  const query = `
    [out:json][timeout:${ROUTE_CONFIG.overpass.queryTimeoutSeconds}];

    (
      node["${key}"="${value}"]
        (around:${radiusMeters},${start.latitude},${start.longitude});

      way["${key}"="${value}"]
        (around:${radiusMeters},${start.latitude},${start.longitude});

      relation["${key}"="${value}"]
        (around:${radiusMeters},${start.latitude},${start.longitude});
    );

    out center tags;
  `;

  const data =
    await executeOverpassQuery(query);

  return data.elements
    .map(
      (
        element,
      ): PointOfInterest | null => {
        const latitude =
          element.lat ??
          element.center?.lat;

        const longitude =
          element.lon ??
          element.center?.lon;

        if (
          latitude === undefined ||
          longitude === undefined
        ) {
          return null;
        }

        return {
          id: element.id,
          name: getPlaceName(
            element,
            category,
          ),
          category,

          coordinate: {
            latitude,
            longitude,
          },
        };
      },
    )
    .filter(
      (
        place,
      ): place is PointOfInterest =>
        place !== null,
    );
}

export async function findNearestPlace(
  start: RouteCoordinate,
  category: RouteCategory,
  radiusMeters = 3000,
): Promise<PointOfInterest | null> {
  const places =
    await findNearbyPlaces(
      start,
      category,
      radiusMeters,
    );

  if (places.length === 0) {
    return null;
  }

  return places.reduce(
    (nearest, current) => {
      const nearestDistance =
        calculateDistanceMeters(
          start,
          nearest.coordinate,
        );

      const currentDistance =
        calculateDistanceMeters(
          start,
          current.coordinate,
        );

      return currentDistance <
        nearestDistance
        ? current
        : nearest;
    },
  );
}

export async function findAvailableCategories(
  start: RouteCoordinate,
  radiusMeters = 3000,
): Promise<RouteCategory[]> {
  const categoryQueries =
    ROUTE_CATEGORIES.map(
      ({ osm }) => `
        node["${osm.key}"="${osm.value}"]
          (around:${radiusMeters},${start.latitude},${start.longitude});

        way["${osm.key}"="${osm.value}"]
          (around:${radiusMeters},${start.latitude},${start.longitude});

        relation["${osm.key}"="${osm.value}"]
          (around:${radiusMeters},${start.latitude},${start.longitude});
      `,
    ).join("\n");

  const query = `
    [out:json][timeout:${ROUTE_CONFIG.overpass.queryTimeoutSeconds}];

    (
      ${categoryQueries}
    );

    out center tags;
  `;

  const data =
    await executeOverpassQuery(query);

  const availableCategories =
    new Set<RouteCategory>();

  for (const element of data.elements) {
    const category =
      findCategoryFromTags(
        element.tags,
      );

    if (category) {
      availableCategories.add(
        category,
      );
    }
  }

  return ROUTE_CATEGORIES
    .map(({ id }) => id)
    .filter((category) =>
      availableCategories.has(
        category,
      ),
    );
}

function findCategoryFromTags(
  tags?: Record<string, string>,
): RouteCategory | null {
  if (!tags) {
    return null;
  }

  const category =
    ROUTE_CATEGORIES.find(
      ({ osm }) =>
        tags[osm.key] === osm.value,
    );

  return category?.id ?? null;
}

function getFallbackName(
  category: RouteCategory,
): string {
  const categoryConfig =
    getCategoryConfig(category);

  return categoryConfig.label;
}