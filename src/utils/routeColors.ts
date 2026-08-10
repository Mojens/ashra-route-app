import { COLORS } from "../constants";

export function getSegmentColor(index: number): string {
  return COLORS.routeSegments[
    index % COLORS.routeSegments.length
  ];
}

export function getSegmentStrokeColor(
  index: number,
  isCurrentSegment: boolean,
  isRouteActive: boolean,
): string {
  const color = getSegmentColor(index);

  if (!isRouteActive || isCurrentSegment) {
    return color;
  }

  // 35% opacity
  return `${color}59`;
}