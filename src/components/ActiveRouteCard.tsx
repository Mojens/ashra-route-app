import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

interface ActiveRouteCardProps {
  isVisible: boolean;
  currentStopIndex: number;
  waypoints: PointOfInterest[];
  segments: RouteSegment[];
  onNextStop: () => void;
  onStopRoute: () => void;
}

export default function ActiveRouteCard({
  isVisible,
  currentStopIndex,
  waypoints,
  segments,
  onNextStop,
  onStopRoute,
}: ActiveRouteCardProps) {
  if (!isVisible || segments.length === 0) {
    return null;
  }

  const currentSegment = segments[currentStopIndex];

  if (!currentSegment) {
    return null;
  }

  const isReturnToStart =
    currentStopIndex >= waypoints.length;

  const destination = isReturnToStart
    ? null
    : waypoints[currentStopIndex];

  const isFinalSegment =
    currentStopIndex === segments.length - 1;

  return (
    <SafeAreaView
      pointerEvents="box-none"
      edges={["top"]}
      className="absolute inset-0"
    >
      <View
        pointerEvents="box-none"
        className="flex-1 px-3 pt-3"
      >
        <View className="rounded-3xl bg-white p-4 shadow-xl">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Næste stop
              </Text>

              <Text className="mt-1 text-xl font-bold text-slate-900">
                {isReturnToStart
                  ? "Tilbage til start"
                  : destination?.name ?? "Næste stop"}
              </Text>

              {destination && (
                <Text className="mt-1 text-sm text-slate-500">
                  Stop {currentStopIndex + 1} ·{" "}
                  {CATEGORY_LABELS[destination.category]}
                </Text>
              )}
            </View>

            <View
              style={{
                backgroundColor:
                  getSegmentColor(currentStopIndex),
              }}
              className="h-11 w-11 items-center justify-center rounded-full"
            >
              <Text className="text-base font-bold text-white">
                {isReturnToStart
                  ? "⌂"
                  : currentStopIndex + 1}
              </Text>
            </View>
          </View>

          <View className="mt-4 flex-row justify-between rounded-2xl bg-slate-50 p-4">
            <View>
              <Text className="text-xs uppercase text-slate-500">
                Distance
              </Text>

              <Text className="mt-1 text-lg font-bold text-slate-900">
                {formatDistanceKm(
                  currentSegment.distanceMeters,
                )}
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-xs uppercase text-slate-500">
                Estimeret tid
              </Text>

              <Text className="mt-1 text-lg font-bold text-slate-900">
                {formatDurationMinutes(
                  currentSegment.durationSeconds,
                )}
              </Text>
            </View>
          </View>

          <View className="mt-4 flex-row gap-3">
            <Pressable
              onPress={onStopRoute}
              className="flex-1 items-center rounded-2xl bg-slate-100 py-3 active:bg-slate-200"
            >
              <Text className="font-semibold text-slate-700">
                Afslut
              </Text>
            </Pressable>

            <Pressable
              onPress={onNextStop}
              className="flex-[2] items-center rounded-2xl bg-blue-600 py-3 active:bg-blue-700"
            >
              <Text className="font-bold text-white">
                {isFinalSegment
                  ? "Afslut tur"
                  : "Næste stop"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}