import { COLORS } from "../constants";

export function getSegmentColor(index: number): string {
  return COLORS.routeSegments[
    index % COLORS.routeSegments.length
  ];
}