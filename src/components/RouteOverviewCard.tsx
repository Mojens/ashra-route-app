import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PointOfInterest, RouteSegment } from "../types/route";
import RouteOverview from "./RouteOverview";

interface RouteOverviewCardProps {
  waypoints: PointOfInterest[];
  segments: RouteSegment[];
  isVisible: boolean;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onStartRoute: () => void;
}

export default function RouteOverviewCard({
  waypoints,
  segments,
  isVisible,
  isExpanded,
  onToggleExpanded,
  onStartRoute,
}: RouteOverviewCardProps) {
  if (!isVisible || segments.length === 0) {
    return null;
  }

  if (!isExpanded) {
    return (
      <SafeAreaView
        pointerEvents="box-none"
        edges={["top"]}
        className="absolute inset-0"
      >
        <View
          pointerEvents="box-none"
          className="flex-1 items-end px-4 pt-3"
        >
          <Pressable
            onPress={onToggleExpanded}
            accessibilityRole="button"
            accessibilityLabel="Vis ruteoversigt"
            className="h-12 w-12 items-center justify-center rounded-full bg-blue-600 shadow-lg active:bg-blue-700"
          >
            <Text className="text-xl font-bold text-white">
              i
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
        <View className="max-h-[55%] rounded-3xl bg-white p-4 shadow-xl">
          <View className="mb-3 flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-bold text-slate-900">
                Ruteoversigt
              </Text>

              <Text className="mt-0.5 text-sm text-slate-500">
                {waypoints.length}{" "}
                {waypoints.length === 1 ? "stop" : "stop"}
              </Text>
            </View>

            <Pressable
              onPress={onToggleExpanded}
              accessibilityRole="button"
              accessibilityLabel="Minimér ruteoversigt"
              className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200"
            >
              <Text className="text-xl font-bold text-slate-700">
                −
              </Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator
            nestedScrollEnabled
            contentContainerClassName="pb-2"
          >
            <RouteOverview
              waypoints={waypoints}
              segments={segments}
            />
            <Pressable
              onPress={onStartRoute}
              className="mt-3 items-center rounded-2xl bg-blue-600 py-4 active:bg-blue-700"
            >
              <Text className="text-base font-bold text-white">
                Start tur
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}