import axios from "axios";

import { ROUTE_CONFIG } from "../constants";
import {
  GeneratedRoute,
  NavigationInstruction,
  NavigationManeuver,
  RouteCoordinate,
  RouteSegment,
} from "../types/route";

interface OpenRouteServiceStep {
  distance: number;
  duration: number;
  type: number;
  instruction: string;
  way_points: [number, number];
  name?: string;
}

interface OpenRouteServiceSegment {
  distance: number;
  duration: number;
  steps?: OpenRouteServiceStep[];
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
        coordinates:
          requestedCoordinates.map(
            ({ longitude, latitude }) => [
              longitude,
              latitude,
            ],
          ),

        instructions: true,
        instructions_format: "text",
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
  seed =
    ROUTE_CONFIG.freeRoundTrip.defaultSeed,
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

        instructions: true,
        instructions_format: "text",

        options: {
          round_trip: {
            length: targetDistanceMeters,

            points:
              ROUTE_CONFIG.freeRoundTrip
                .points,

            seed,
          },
        },
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

  const apiSegment =
    feature.properties.segments?.[0];

  const segment: RouteSegment | null =
    apiSegment
      ? {
        from: origin,
        to: origin,

        coordinates:
          routeCoordinates,

        distanceMeters:
          apiSegment.distance,

        durationSeconds:
          apiSegment.duration,

        instructions:
          createNavigationInstructions(
            apiSegment.steps,
            routeCoordinates,
          ),
      }
      : null;

  return {
    coordinates: routeCoordinates,

    distanceMeters:
      feature.properties.summary.distance,

    durationSeconds:
      feature.properties.summary.duration,

    segments: segment
      ? [segment]
      : [],
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
        coordinates:
          requestedCoordinates.map(
            ({ longitude, latitude }) => [
              longitude,
              latitude,
            ],
          ),

        instructions: true,
        instructions_format: "text",
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

  return apiSegments.map(
    (segment, index) => {
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
        from:
          requestedCoordinates[index],

        to:
          requestedCoordinates[
          index + 1
          ],

        coordinates:
          routeCoordinates.slice(
            startIndex,
            endIndex + 1,
          ),

        distanceMeters:
          segment.distance,

        durationSeconds:
          segment.duration,

        instructions:
          createNavigationInstructions(
            segment.steps,
            routeCoordinates,
          ),
      };
    },
  );
}

function createNavigationInstructions(
  steps:
    | OpenRouteServiceStep[]
    | undefined,

  routeCoordinates: RouteCoordinate[],
): NavigationInstruction[] {
  if (!steps) {
    return [];
  }

  return steps.map((step) => {
    const [
      startIndex,
      endIndex,
    ] = step.way_points;

    const coordinate =
      routeCoordinates[endIndex] ??
      routeCoordinates[startIndex] ??
      routeCoordinates[
      routeCoordinates.length - 1
      ];

    return {
      instruction:
        step.instruction,

      roadName:
        step.name?.trim() || undefined,

      distanceMeters:
        step.distance,

      durationSeconds:
        step.duration,

      maneuver:
        mapInstructionType(
          step.type,
        ),

      wayPoints: [
        startIndex,
        endIndex,
      ],

      coordinate,
    };
  });
}

function mapInstructionType(
  type: number,
): NavigationManeuver {
  switch (type) {
    case 0:
      return "left";

    case 1:
      return "right";

    case 2:
      return "sharp-left";

    case 3:
      return "sharp-right";

    case 4:
      return "slight-left";

    case 5:
      return "slight-right";

    case 6:
      return "straight";

    case 7:
      return "roundabout";

    case 8:
      return "exit-roundabout";

    case 9:
      return "u-turn";

    case 10:
      return "arrive";

    case 11:
      return "depart";

    case 12:
      return "keep-left";

    case 13:
      return "keep-right";

    default:
      return "unknown";
  }
}