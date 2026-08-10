export const MAP_CONFIG = {
  initialRegion: {
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  },

  routeEdgePadding: {
    top: 80,
    right: 50,
    bottom: 180,
    left: 50,
  },

  routeStrokeWidth: 6,

  navigation: {
    latitudeDelta: 0.006,
    longitudeDelta: 0.006,
    animationDurationMs: 700,
    inactiveSegmentOpacity: 0.35,
  },
} as const;