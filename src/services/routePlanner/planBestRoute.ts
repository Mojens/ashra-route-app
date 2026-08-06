import { RouteCoordinate } from "../../types/route";
import { planRouteSuggestions } from "./planRouteSuggestions";

import {
  CandidateRoutePlan,
  PlannedRoute,
} from "./types";

interface PlanBestRouteOptions {
  origin: RouteCoordinate;
  candidates: CandidateRoutePlan[];
  targetDistanceMeters: number;
  candidateLimit?: number;
}

export async function planBestRoute({
  origin,
  candidates,
  targetDistanceMeters,
  candidateLimit = 4,
}: PlanBestRouteOptions): Promise<PlannedRoute | null> {
  const suggestions = await planRouteSuggestions({
    origin,
    candidates,
    targetDistanceMeters,
    candidateLimit,
    suggestionLimit: 1,
  });

  return suggestions[0] ?? null;
}