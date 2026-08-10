import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Polyline, Region } from "react-native-maps";
import * as Location from "expo-location";
import RoutePanel from "../components/RoutePanel";
import WaypointMarker from "../components/WaypointMarker";
import { COLORS, MAP_CONFIG, STEP_CONFIG } from "../constants";
import { useRoutePlanner } from "../hooks/useRoutePlanner";
import { PointOfInterest, RouteCategory, RouteCoordinate, RouteSegment } from "../types/route";
import { getSegmentColor } from "../utils/routeColors";
import RouteOverviewCard from "../components/RouteOverviewCard";
import ActiveRouteCard from "../components/ActiveRouteCard";
import RouteSuggestionsModal from "../components/RouteSuggestionsModal";
import { GeneratedRoutePlan } from "../services/routePlanner";
import { useTranslation } from "react-i18next";
import { useActiveRouteNavigation } from "../hooks/useActiveRouteNavigation";
import * as Haptics from "expo-haptics";
import StopReachedBanner from "../components/StopReachedBanner";

export default function HomeScreen() {
  // Reached banner state
  const [isStopReachedVisible, setIsStopReachedVisible] =
    useState(false);

  const [reachedPlaceName, setReachedPlaceName] =
    useState<string | null>(null);

  const [isRouteCompleted, setIsRouteCompleted] =
    useState(false);

  // i18n
  const { t } = useTranslation();
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

  const [routeSuggestions, setRouteSuggestions] =
    useState<GeneratedRoutePlan[]>([]);

  const [
    isRouteSuggestionsVisible,
    setIsRouteSuggestionsVisible,
  ] = useState(false);

  const applyRoutePlan = (
    result: GeneratedRoutePlan,
  ): void => {
    const waypointPlaces = result.waypoints.map(
      ({ place }) => place,
    );

    setSelectedWaypoints(waypointPlaces);
    setRouteCoordinates(result.route.coordinates);
    setRouteSegments(result.route.segments ?? []);
    setRouteDistance(result.route.distanceMeters);
    setRouteDuration(result.route.durationSeconds);

    setIsPanelCollapsed(true);
    setIsRouteOverviewExpanded(false);
    setIsRouteActive(false);
    setCurrentStopIndex(0);

    const coordinatesToFit: RouteCoordinate[] = [
      ...result.route.coordinates,
      ...result.waypoints.map(
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
  };

  const handleStartRoute = (): void => {
    if (routeSegments.length === 0) {
      Alert.alert(
        t("Ingen rute"),
        t("Generér en rute, før du starter turen."),
      );
      return;
    }

    setCurrentStopIndex(0);
    setIsRouteActive(true);
    setIsRouteOverviewExpanded(false);
    setIsPanelCollapsed(true);
  };

  const handleDestinationReached =
    useCallback((): void => {
      const isReturningToStart =
        currentStopIndex >= selectedWaypoints.length;

      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      );

      if (isReturningToStart) {
        setReachedPlaceName(null);
        setIsRouteCompleted(true);
        setIsStopReachedVisible(true);

        return;
      }

      const reachedWaypoint =
        selectedWaypoints[currentStopIndex];

      setReachedPlaceName(
        reachedWaypoint?.name ?? null,
      );

      setIsRouteCompleted(false);
      setIsStopReachedVisible(true);
    }, [
      currentStopIndex,
      selectedWaypoints,
    ]);

  const handleContinueAfterReached =
    useCallback((): void => {
      setIsStopReachedVisible(false);

      if (isRouteCompleted) {
        setIsRouteActive(false);
        setCurrentStopIndex(0);
        setReachedPlaceName(null);
        setIsRouteCompleted(false);

        return;
      }

      setCurrentStopIndex(
        (current) => current + 1,
      );
    }, [isRouteCompleted]);

  const handleNextStop = useCallback((): void => {
    if (
      currentStopIndex >=
      routeSegments.length - 1
    ) {
      setIsRouteActive(false);
      setCurrentStopIndex(0);

      Alert.alert(
        t("Turen er færdig"),
        t("Godt gået! Du er tilbage ved start."),
      );

      return;
    }

    setCurrentStopIndex(
      (current) => current + 1,
    );
  }, [
    currentStopIndex,
    routeSegments.length,
    t,
  ]);

  const handleStopRoute = (): void => {
    setIsRouteActive(false);
    setCurrentStopIndex(0);
  };

  const {
    generateRoutePlans,
    isBusy,
    errorMessage: routePlannerError,
  } = useRoutePlanner();

  // Active route navigation state
  const {
    currentPosition,
    distanceToNextStopMeters,
    locationError: navigationLocationError,
  } = useActiveRouteNavigation({
    isActive: isRouteActive,
    currentStopIndex,
    segments: routeSegments,
    onDestinationReached: handleDestinationReached,
  });
  useEffect(() => {
    if (!isRouteActive) {
      return;
    }

    console.log("Live navigation:", {
      currentPosition,
      distanceToNextStopMeters,
      navigationLocationError,
    });
  }, [
    currentPosition,
    distanceToNextStopMeters,
    navigationLocationError,
    isRouteActive,
  ]);

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
          t("Appen skal have adgang til din lokation."),
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
        t("Kunne ikke hente lokationen:"),
        error,
      );

      setErrorMessage(
        t("Din lokation kunne ikke hentes."),
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

  const handleShowRouteSuggestions = (): void => {
    if (routeSuggestions.length === 0) {
      Alert.alert(
        t("Ingen ruteforslag"),
        t("Generér først nogle ruteforslag."),
      );
      return;
    }

    setIsRouteSuggestionsVisible(true);
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
      const suggestions =
        await generateRoutePlans({
          origin,
          selectedCategories,
          selectedSteps,
        });

      if (suggestions.length === 0) {
        throw new Error(
          t("Der blev ikke fundet nogen ruter."),
        );
      }

      /*
       * Ingen kategorier:
       * Vis den ene frie rundtur direkte.
       */
      if (selectedCategories.length === 0) {
        applyRoutePlan(suggestions[0]);
        return;
      }

      /*
       * Kategorier valgt:
       * Lad brugeren vælge mellem forslagene.
       */
      setRouteSuggestions(suggestions);
      setIsRouteSuggestionsVisible(true);
    } catch (error) {
      console.error(
        t("Kunne ikke generere ruter:"),
        error,
      );

      const message =
        routePlannerError ??
        (error instanceof Error
          ? error.message
          : t("Der opstod en ukendt fejl."));

      Alert.alert(
        t("Ruterne kunne ikke genereres"),
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
            {t("Prøv igen")}
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
          {t("Finder din position...")}
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
      <StopReachedBanner
        isVisible={isStopReachedVisible}
        placeName={reachedPlaceName}
        isRouteCompleted={isRouteCompleted}
        onContinue={handleContinueAfterReached}
      />
      <RouteOverviewCard
        waypoints={selectedWaypoints}
        segments={routeSegments}
        isVisible={
          isPanelCollapsed &&
          routeCoordinates.length > 0
        }
        isExpanded={isRouteOverviewExpanded}
        onToggleExpanded={() =>
          setIsRouteOverviewExpanded(
            (current) => !current,
          )
        }
        onStartRoute={handleStartRoute}
        onShowOtherRoutes={
          routeSuggestions.length > 1
            ? handleShowRouteSuggestions
            : undefined
        }
      />

      <ActiveRouteCard
        isVisible={isRouteActive && !isStopReachedVisible}
        currentStopIndex={currentStopIndex}
        waypoints={selectedWaypoints}
        segments={routeSegments}
        distanceToNextStopMeters={distanceToNextStopMeters}
        locationError={navigationLocationError}
        onNextStop={handleNextStop}
        onStopRoute={handleStopRoute}
      />
      <RouteSuggestionsModal
        visible={isRouteSuggestionsVisible}
        suggestions={routeSuggestions}
        onClose={() =>
          setIsRouteSuggestionsVisible(false)
        }
        onSelectRoute={(suggestion) => {
          setIsRouteSuggestionsVisible(false);
          applyRoutePlan(suggestion);
        }}
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
