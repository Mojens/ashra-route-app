import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, {
  Polyline,
  Region,
} from "react-native-maps";
import * as Location from "expo-location";
import RoutePanel from "../components/RoutePanel";
import WaypointMarker from "../components/WaypointMarker";
import {
  COLORS,
  MAP_CONFIG,
  STEP_CONFIG,
} from "../constants";
import { useRoutePlanner } from "../hooks/useRoutePlanner";
import {
  PointOfInterest,
  RouteCategory,
  RouteCoordinate,
  RouteSegment,
} from "../types/route";
import { getSegmentColor } from "../utils/routeColors";
import RouteOverviewCard from "../components/RouteOverviewCard";
import ActiveRouteCard from "../components/ActiveRouteCard";

export default function HomeScreen() {
  // RouteOverviewCard state
  const [isRouteOverviewExpanded, setIsRouteOverviewExpanded] =
    useState(false);
  const [isRouteActive, setIsRouteActive] =
    useState(false);

  const [currentStopIndex, setCurrentStopIndex] =
    useState(0);

  const mapRef = useRef<MapView>(null);

  const [region, setRegion] = useState<Region | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null,
  );

  const [selectedSteps, setSelectedSteps] = useState<number>(
    STEP_CONFIG.defaultSteps,
  );
  const [selectedCategories, setSelectedCategories] = useState<
    RouteCategory[]
  >(["park"]);

  const [isPanelCollapsed, setIsPanelCollapsed] =
    useState(false);

  const [routeCoordinates, setRouteCoordinates] = useState<
    RouteCoordinate[]
  >([]);

  const [routeSegments, setRouteSegments] = useState<
    RouteSegment[]
  >([]);

  const [routeDistance, setRouteDistance] = useState<
    number | null
  >(null);

  const [routeDuration, setRouteDuration] = useState<
    number | null
  >(null);

  const [selectedWaypoints, setSelectedWaypoints] = useState<
    PointOfInterest[]
  >([]);

  const handleStartRoute = (): void => {
    if (routeSegments.length === 0) {
      Alert.alert(
        "Ingen rute",
        "Generér en rute, før du starter turen.",
      );
      return;
    }

    setCurrentStopIndex(0);
    setIsRouteActive(true);
    setIsRouteOverviewExpanded(false);
    setIsPanelCollapsed(true);
  };

  const handleNextStop = (): void => {
    if (
      currentStopIndex >=
      routeSegments.length - 1
    ) {
      setIsRouteActive(false);
      setCurrentStopIndex(0);

      Alert.alert(
        "Turen er færdig",
        "Godt gået! Du er tilbage ved start.",
      );

      return;
    }

    setCurrentStopIndex(
      (current) => current + 1,
    );
  };

  const handleStopRoute = (): void => {
    setIsRouteActive(false);
    setCurrentStopIndex(0);
  };

  const {
    generateRoutePlan,
    isBusy,
    errorMessage: routePlannerError,
  } = useRoutePlanner();

  useEffect(() => {
    void loadCurrentLocation();
  }, []);

  const loadCurrentLocation = async (): Promise<void> => {
    try {
      setErrorMessage(null);

      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        setErrorMessage(
          "Appen skal have adgang til din lokation.",
        );
        return;
      }

      const location =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta:
          MAP_CONFIG.initialRegion.latitudeDelta,
        longitudeDelta:
          MAP_CONFIG.initialRegion.longitudeDelta,
      });
    } catch (error) {
      console.error(
        "Kunne ikke hente lokationen:",
        error,
      );

      setErrorMessage(
        "Din lokation kunne ikke hentes.",
      );
    }
  };

  const toggleCategory = (
    category: RouteCategory,
  ): void => {
    setSelectedCategories((currentCategories) =>
      currentCategories.includes(category)
        ? currentCategories.filter(
          (currentCategory) =>
            currentCategory !== category,
        )
        : [...currentCategories, category],
    );
  };

  const moveCategory = (
    category: RouteCategory,
    direction: "left" | "right",
  ): void => {
    setSelectedCategories((currentCategories) => {
      const currentIndex =
        currentCategories.indexOf(category);

      if (currentIndex === -1) {
        return currentCategories;
      }

      const newIndex =
        direction === "left"
          ? currentIndex - 1
          : currentIndex + 1;

      if (
        newIndex < 0 ||
        newIndex >= currentCategories.length
      ) {
        return currentCategories;
      }

      const reorderedCategories = [
        ...currentCategories,
      ];

      [
        reorderedCategories[currentIndex],
        reorderedCategories[newIndex],
      ] = [
          reorderedCategories[newIndex],
          reorderedCategories[currentIndex],
        ];

      return reorderedCategories;
    });
  };

  const handleGenerateRoute = async (): Promise<void> => {
    if (!region || isBusy) {
      return;
    }

    const origin: RouteCoordinate = {
      latitude: region.latitude,
      longitude: region.longitude,
    };

    try {
      const result = await generateRoutePlan({
        origin,
        selectedCategories,
        selectedSteps,
      });

      const waypoints = result.waypoints ?? [];
      const coordinates = result.route.coordinates ?? [];
      const segments = result.route.segments ?? [];

      const waypointPlaces = waypoints.map(
        ({ place }) => place,
      );

      setSelectedWaypoints(waypointPlaces);
      setRouteCoordinates(coordinates);
      setRouteSegments(segments);
      setRouteDistance(result.route.distanceMeters);
      setRouteDuration(result.route.durationSeconds);
      setIsPanelCollapsed(true);
      setIsRouteOverviewExpanded(false);
      setIsRouteActive(false);
      setCurrentStopIndex(0);

      console.log("Valgt rute:", {
        targetKm: result.targetDistanceMeters / 1000,
        actualKm: result.route.distanceMeters / 1000,
        differenceKm: result.differenceMeters / 1000,
        waypoints: waypoints.map(
          ({ category, place }) => ({
            category,
            name: place.name,
          }),
        ),
      });

      const coordinatesToFit: RouteCoordinate[] = [
        ...coordinates,
        ...waypoints.map(
          ({ place }) => place.coordinate,
        ),
      ];

      if (coordinatesToFit.length > 0) {
        mapRef.current?.fitToCoordinates(
          coordinatesToFit,
          {
            edgePadding:
              MAP_CONFIG.routeEdgePadding,
            animated: true,
          },
        );
      }
    } catch (error) {
      console.error(
        "Kunne ikke generere ruten:",
        error,
      );

      const message =
        routePlannerError ??
        (error instanceof Error
          ? error.message
          : "Der opstod en ukendt fejl.");

      Alert.alert(
        "Ruten kunne ikke genereres",
        message,
      );
    }
  };

  if (errorMessage) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100 px-6">
        <Text className="text-center text-base text-red-600">
          {errorMessage}
        </Text>

        <Pressable
          className="mt-5 rounded-xl bg-blue-600 px-5 py-3 active:bg-blue-700"
          onPress={() => void loadCurrentLocation()}
        >
          <Text className="font-semibold text-white">
            Prøv igen
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!region) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100">
        <ActivityIndicator size="large" />

        <Text className="mt-3 text-base text-slate-700">
          Finder din position...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton
      >
        {selectedWaypoints.map((place, index) => (
          <WaypointMarker
            key={`${place.category}-${place.id}-${index}`}
            place={place}
            stopNumber={index + 1}
            color={getSegmentColor(index)}
          />
        ))}

        {routeSegments.length > 0
          ? routeSegments.map((segment, index) => (
            <Polyline
              key={`route-segment-${index}`}
              coordinates={segment.coordinates}
              strokeWidth={MAP_CONFIG.routeStrokeWidth}
              strokeColor={getSegmentColor(index)}
              lineCap="round"
              lineJoin="round"
            />
          ))
          : routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={MAP_CONFIG.routeStrokeWidth}
              strokeColor={COLORS.primary}
              lineCap="round"
              lineJoin="round"
            />
          )}
      </MapView>

      <RouteOverviewCard
        waypoints={selectedWaypoints}
        segments={routeSegments}
        isVisible={
          isPanelCollapsed &&
          !isRouteActive
        }
        isExpanded={isRouteOverviewExpanded}
        onToggleExpanded={() =>
          setIsRouteOverviewExpanded(
            (current) => !current,
          )
        }
        onStartRoute={handleStartRoute}
      />

      <ActiveRouteCard
        isVisible={isRouteActive}
        currentStopIndex={currentStopIndex}
        waypoints={selectedWaypoints}
        segments={routeSegments}
        onNextStop={handleNextStop}
        onStopRoute={handleStopRoute}
      />

      {!isRouteActive && (
        <RoutePanel
          selectedSteps={selectedSteps}
          selectedCategories={selectedCategories}
          isCollapsed={isPanelCollapsed}
          isGeneratingRoute={isBusy}
          routeDistance={routeDistance}
          routeDuration={routeDuration}
          onSelectSteps={setSelectedSteps}
          onToggleCategory={toggleCategory}
          onMoveCategory={moveCategory}
          onToggleCollapsed={() =>
            setIsPanelCollapsed(
              (current) => !current,
            )
          }
          onGenerateRoute={handleGenerateRoute}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});