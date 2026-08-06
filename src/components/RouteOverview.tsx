import { Text, View } from "react-native";
import { CATEGORY_LABELS } from "../constants";
import {
  PointOfInterest,
  RouteSegment,
} from "../types/route";
import {
  formatDistanceKm,
  formatDurationMinutes,
} from "../utils/format";
import { getSegmentColor } from "../utils/routeColors";

interface RouteOverviewProps {
  waypoints: PointOfInterest[];
  segments: RouteSegment[];
}

export default function RouteOverview({
  waypoints,
  segments,
}: RouteOverviewProps) {
  if (segments.length === 0) {
    return null;
  }

  return (
    <View>
      <Text className="mb-4 text-base font-bold text-slate-900">
        Din rute
      </Text>

      {segments.map((segment, index) => {
        const destination = waypoints[index];
        const isReturnSegment =
          index === segments.length - 1;

        return (
          <View
            key={`route-overview-segment-${index}`}
            className="flex-row"
          >
            <View className="items-center">
              <View
                style={{
                  backgroundColor: getSegmentColor(index),
                }}
                className="h-8 w-8 items-center justify-center rounded-full"
              >
                <Text className="font-bold text-white">
                  {isReturnSegment ? "⌂" : index + 1}
                </Text>
              </View>

              {index < segments.length - 1 && (
                <View className="h-12 w-0.5 bg-slate-300" />
              )}
            </View>

            <View className="ml-3 flex-1 pb-4">
              <Text className="font-semibold text-slate-900">
                {isReturnSegment
                  ? "Tilbage til start"
                  : destination?.name ??
                    CATEGORY_LABELS[
                      destination?.category ?? "park"
                    ]}
              </Text>

              {!isReturnSegment && destination && (
                <Text className="mt-0.5 text-sm text-slate-500">
                  {CATEGORY_LABELS[destination.category]}
                </Text>
              )}

              <Text className="mt-1 text-sm text-slate-600">
                {formatDistanceKm(
                  segment.distanceMeters,
                )}{" "}
                ·{" "}
                {formatDurationMinutes(
                  segment.durationSeconds,
                )}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}