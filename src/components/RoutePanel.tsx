import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StepSelector from "./StepSelector";
import { RouteCategory } from "../types/route";
import { stepsToKm, stepsToMinutes } from "../utils/steps";
import CategorySelector from "./CategorySelector";
import {
  formatDistanceKm,
  formatDurationMinutes,
  formatSteps,
} from "../utils/format";

interface RoutePanelProps {
  selectedSteps: number;
  selectedCategories: RouteCategory[];
  isCollapsed: boolean;
  isGeneratingRoute?: boolean;
  routeDistance?: number | null;
  routeDuration?: number | null;
  onSelectSteps: (steps: number) => void;
  onToggleCategory: (category: RouteCategory) => void;
  onMoveCategory: (
    category: RouteCategory,
    direction: "left" | "right",
  ) => void;
  onToggleCollapsed: () => void;
  onGenerateRoute: () => void;
}

export default function RoutePanel({
  selectedSteps,
  selectedCategories,
  isCollapsed,
  isGeneratingRoute = false,
  routeDistance = null,
  routeDuration = null,
  onSelectSteps,
  onToggleCategory,
  onMoveCategory,
  onToggleCollapsed,
  onGenerateRoute,
}: RoutePanelProps) {
  return (
    <SafeAreaView
      className="absolute inset-0 justify-end"
      edges={["bottom"]}
      pointerEvents="box-none"
    >
      <View className="mx-3 mb-2 rounded-3xl bg-white p-4 shadow-lg">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-xl font-bold text-slate-900">
              Planlæg din gåtur
            </Text>

            {!isCollapsed && (
              <Text className="mt-1 text-sm text-slate-500">
                Vælg antal skridt og steder på ruten
              </Text>
            )}
          </View>

          <Pressable
            onPress={onToggleCollapsed}
            className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200"
          >
            <Text className="text-xl font-bold text-slate-700">
              {isCollapsed ? "⌃" : "⌄"}
            </Text>
          </Pressable>
        </View>

        {isCollapsed ? (
          <CollapsedSummary
            selectedSteps={selectedSteps}
            selectedCategories={selectedCategories}
          />
        ) : (
          <ExpandedContent
            selectedSteps={selectedSteps}
            selectedCategories={selectedCategories}
            isGeneratingRoute={isGeneratingRoute}
            routeDistance={routeDistance}
            routeDuration={routeDuration}
            onSelectSteps={onSelectSteps}
            onToggleCategory={onToggleCategory}
            onMoveCategory={onMoveCategory}
            onGenerateRoute={onGenerateRoute}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

interface CollapsedSummaryProps {
  selectedSteps: number;
  selectedCategories: RouteCategory[];
}

function CollapsedSummary({
  selectedSteps,
  selectedCategories,
}: CollapsedSummaryProps) {
  return (
    <View className="mt-3 flex-row items-center justify-between">
      <View>
        <Text className="text-sm text-slate-500">Valgt rute</Text>

        <Text className="font-semibold text-slate-900">
          {formatSteps(selectedSteps)} skridt
        </Text>
      </View>

      <View className="items-end">
        <Text className="text-sm text-slate-500">
          {selectedCategories.length} stop
        </Text>

        <Text className="text-sm font-medium text-blue-600">
          {stepsToKm(selectedSteps)} km
        </Text>
      </View>
    </View>
  );
}

interface ExpandedContentProps {
  selectedSteps: number;
  selectedCategories: RouteCategory[];
  isGeneratingRoute: boolean;
  routeDistance: number | null;
  routeDuration: number | null;
  onSelectSteps: (steps: number) => void;
  onToggleCategory: (category: RouteCategory) => void;
  onMoveCategory: (
    category: RouteCategory,
    direction: "left" | "right",
  ) => void;
  onGenerateRoute: () => void;
}

function ExpandedContent({
  selectedSteps,
  selectedCategories,
  isGeneratingRoute,
  routeDistance,
  routeDuration,
  onSelectSteps,
  onToggleCategory,
  onMoveCategory,
  onGenerateRoute,
}: ExpandedContentProps) {
  return (
    <>
      <View className="mt-4">
        <StepSelector
          selectedSteps={selectedSteps}
          onSelectSteps={onSelectSteps}
        />
      </View>

      <EstimatedRouteSummary selectedSteps={selectedSteps} />

      <View className="my-5 h-px bg-slate-200" />

      <CategorySelector
        selectedCategories={selectedCategories}
        onToggleCategory={onToggleCategory}
        onMoveCategory={onMoveCategory}
      />

      {routeDistance !== null && routeDuration !== null && (
        <GeneratedRouteSummary
          distanceMeters={routeDistance}
          durationSeconds={routeDuration}
        />
      )}

      <Pressable
        className={[
          "mt-5 items-center rounded-2xl py-4",
          isGeneratingRoute
            ? "bg-blue-400"
            : "bg-blue-600 active:bg-blue-700",
        ].join(" ")}
        disabled={isGeneratingRoute}
        onPress={onGenerateRoute}
      >
        <Text className="text-base font-bold text-white">
          {isGeneratingRoute
            ? "Genererer rute..."
            : "Generér rute"}
        </Text>
      </Pressable>
    </>
  );
}

function EstimatedRouteSummary({
  selectedSteps,
}: {
  selectedSteps: number;
}) {
  return (
    <View className="mt-4 flex-row justify-between rounded-2xl bg-blue-50 p-4">
      <View>
        <Text className="text-xs uppercase tracking-wide text-slate-500">
          Distance
        </Text>

        <Text className="text-xl font-bold text-blue-600">
          {stepsToKm(selectedSteps)} km
        </Text>
      </View>

      <View className="items-end">
        <Text className="text-xs uppercase tracking-wide text-slate-500">
          Estimeret tid
        </Text>

        <Text className="text-xl font-bold text-blue-600">
          {stepsToMinutes(selectedSteps)} min
        </Text>
      </View>
    </View>
  );
}

interface GeneratedRouteSummaryProps {
  distanceMeters: number;
  durationSeconds: number;
}

function GeneratedRouteSummary({
  distanceMeters,
  durationSeconds,
}: GeneratedRouteSummaryProps) {
  return (
    <View className="mt-4 flex-row justify-between rounded-2xl bg-green-50 p-4">
      <View>
        <Text className="text-xs uppercase text-slate-500">
          Faktisk distance
        </Text>

        <Text className="text-lg font-bold text-green-700">
          {formatDistanceKm(distanceMeters)}
        </Text>
      </View>

      <View className="items-end">
        <Text className="text-xs uppercase text-slate-500">
          Rutetid
        </Text>

        <Text className="text-lg font-bold text-green-700">
          {formatDurationMinutes(durationSeconds)}
        </Text>
      </View>
    </View>
  );
}