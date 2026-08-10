import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { CATEGORY_LABELS } from "../constants";
import { PointOfInterest, RouteSegment } from "../types/route";
import { formatDistance, formatDurationMinutes } from "../utils/format";
import { getSegmentColor } from "../utils/routeColors";

interface ActiveRouteCardProps {
  isVisible: boolean;
  currentStopIndex: number;
  waypoints: PointOfInterest[];
  segments: RouteSegment[];
  distanceToNextStopMeters?: number | null;
  locationError?: string | null;
  isOffRoute?: boolean;
  isRerouting?: boolean;
  isOffRouteConfirmed?: boolean;
  onReroute?: () => void;
  onNextStop: () => void;
  onStopRoute: () => void;
}

export default function ActiveRouteCard({
  isVisible,
  currentStopIndex,
  waypoints,
  segments,
  distanceToNextStopMeters = null,
  locationError = null,
  isOffRoute = false,
  isRerouting = false,
  isOffRouteConfirmed = false,
  onReroute,
  onNextStop,
  onStopRoute,
}: ActiveRouteCardProps) {
  const { t } = useTranslation();

  if (!isVisible || segments.length === 0) {
    return null;
  }

  const currentSegment = segments[currentStopIndex];

  if (!currentSegment) {
    return null;
  }

  const remainingDurationSeconds =
    distanceToNextStopMeters !== null &&
      currentSegment.distanceMeters > 0
      ? currentSegment.durationSeconds *
      (distanceToNextStopMeters /
        currentSegment.distanceMeters)
      : currentSegment.durationSeconds;

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
                {t("Næste stop")}
              </Text>

              <Text className="mt-1 text-xl font-bold text-slate-900">
                {isReturnToStart
                  ? t("Tilbage til start")
                  : destination?.name ?? t("Næste stop")}
              </Text>

              {destination && (
                <Text className="mt-1 text-sm text-slate-500">
                  {t("Stop")} {currentStopIndex + 1} ·{" "}
                  {t(CATEGORY_LABELS[destination.category])}
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
            {!locationError && (
              <View>
                <Text className="text-xs uppercase text-slate-500">
                  {distanceToNextStopMeters !== null
                    ? t("Til næste stop")
                    : t("Distance")}
                </Text>

                <Text className="mt-1 text-lg font-bold text-slate-900">
                  {distanceToNextStopMeters !== null
                    ? formatDistance(
                      distanceToNextStopMeters,
                    )
                    : formatDistance(
                      currentSegment.distanceMeters,
                    )}
                </Text>
              </View>
            )}

            {!locationError && (
              <View className="items-end">
                <Text className="text-xs uppercase text-slate-500">
                  {t("Estimeret tid")}
                </Text>

                <Text className="mt-1 text-lg font-bold text-slate-900">
                  {formatDurationMinutes(
                    remainingDurationSeconds,
                  )}
                </Text>
              </View>
            )}
          </View>

          {locationError && (
            <View className="mt-3 rounded-xl bg-red-50 p-3">
              <Text className="text-sm text-red-700">
                {t("Din position kunne ikke opdateres.")}
              </Text>
            </View>
          )}

          {isOffRoute && (
            <View className="mt-3 rounded-2xl bg-orange-50 p-3">
              <Text className="font-semibold text-orange-700">
                {t("Du er gået væk fra ruten")}
              </Text>

              <Text className="mt-1 text-sm text-orange-600">
                {isOffRouteConfirmed
                  ? t("Vil du genberegne ruten?")
                  : t("Kontrollerer din position...")}
              </Text>

              {isOffRouteConfirmed && onReroute && (
                <Pressable
                  onPress={onReroute}
                  disabled={isRerouting}
                  className={[
                    "mt-3 items-center rounded-xl py-3",
                    isRerouting
                      ? "bg-orange-300"
                      : "bg-orange-600 active:bg-orange-700",
                  ].join(" ")}
                >
                  <Text className="font-bold text-white">
                    {isRerouting
                      ? t("Genberegner rute...")
                      : t("Genberegn rute")}
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          <View className="mt-4 flex-row gap-3">
            <Pressable
              onPress={onStopRoute}
              className="flex-1 items-center rounded-2xl bg-slate-100 py-3 active:bg-slate-200"
            >
              <Text className="font-semibold text-slate-700">
                {t("Afslut")}
              </Text>
            </Pressable>

            <Pressable
              onPress={onNextStop}
              className="flex-[2] items-center rounded-2xl bg-blue-600 py-3 active:bg-blue-700"
            >
              <Text className="font-bold text-white">
                {isFinalSegment
                  ? t("Afslut tur")
                  : t("Næste stop")}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}