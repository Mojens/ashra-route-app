import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FilterSelector from "./CategorySelector";
import StepSelector from "./StepSelector";
import { RouteCategory } from "../types/route";
import { stepsToKm, stepsToMinutes } from "../utils/steps";

interface RoutePanelProps {
  selectedSteps: number;
  selectedFilters: RouteCategory[];
  isCollapsed: boolean;
  isGeneratingRoute?: boolean;
  routeDistance?: number | null;
  routeDuration?: number | null;
  onSelectSteps: (steps: number) => void;
  onToggleFilter: (filter: RouteCategory) => void;
  onToggleCollapsed: () => void;
  onGenerateRoute: () => void;
}

export default function RoutePanel({
  selectedSteps,
  selectedFilters,
  isCollapsed,
  isGeneratingRoute = false,
  routeDistance = null,
  routeDuration = null,
  onSelectSteps,
  onToggleFilter,
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
            selectedFilters={selectedFilters}
          />
        ) : (
          <ExpandedContent
            selectedSteps={selectedSteps}
            selectedFilters={selectedFilters}
            isGeneratingRoute={isGeneratingRoute}
            routeDistance={routeDistance}
            routeDuration={routeDuration}
            onSelectSteps={onSelectSteps}
            onToggleFilter={onToggleFilter}
            onGenerateRoute={onGenerateRoute}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

interface CollapsedSummaryProps {
  selectedSteps: number;
  selectedFilters: RouteCategory[];
}

function CollapsedSummary({
  selectedSteps,
  selectedFilters,
}: CollapsedSummaryProps) {
  return (
    <View className="mt-3 flex-row items-center justify-between">
      <View>
        <Text className="text-sm text-slate-500">Valgt rute</Text>

        <Text className="font-semibold text-slate-900">
          {selectedSteps.toLocaleString("da-DK")} skridt
        </Text>
      </View>

      <View className="items-end">
        <Text className="text-sm text-slate-500">
          {selectedFilters.length}{" "}
          {selectedFilters.length === 1 ? "filter" : "filtre"}
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
  selectedFilters: RouteCategory[];
  isGeneratingRoute: boolean;
  routeDistance: number | null;
  routeDuration: number | null;
  onSelectSteps: (steps: number) => void;
  onToggleFilter: (filter: RouteCategory) => void;
  onGenerateRoute: () => void;
}

function ExpandedContent({
  selectedSteps,
  selectedFilters,
  isGeneratingRoute,
  routeDistance,
  routeDuration,
  onSelectSteps,
  onToggleFilter,
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

      <FilterSelector
        selectedFilters={selectedFilters}
        onToggleFilter={onToggleFilter}
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
          {(distanceMeters / 1000).toFixed(1)} km
        </Text>
      </View>

      <View className="items-end">
        <Text className="text-xs uppercase text-slate-500">
          Rutetid
        </Text>

        <Text className="text-lg font-bold text-green-700">
          {Math.round(durationSeconds / 60)} min
        </Text>
      </View>
    </View>
  );
}