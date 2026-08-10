import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View, ImageBackground } from "react-native";
import MapView, { Polyline, Region } from "react-native-maps";
import * as Location from "expo-location";
import RoutePanel from "../components/RoutePanel";
import WaypointMarker from "../components/WaypointMarker";
import { COLORS, MAP_CONFIG, ROUTE_CATEGORIES, ROUTE_CONFIG, STEP_CONFIG } from "../constants";
import { useRoutePlanner } from "../hooks/useRoutePlanner";
import { PointOfInterest, RouteCategory, RouteCoordinate, RouteSegment } from "../types/route";
import { getSegmentColor, getSegmentStrokeColor } from "../utils/routeColors";
import RouteOverviewCard from "../components/RouteOverviewCard";
import ActiveRouteCard from "../components/ActiveRouteCard";
import RouteSuggestionsModal from "../components/RouteSuggestionsModal";
import { GeneratedRoutePlan } from "../services/routePlanner";
import { useTranslation } from "react-i18next";
import { useActiveRouteNavigation } from "../hooks/useActiveRouteNavigation";
import * as Haptics from "expo-haptics";
import StopReachedBanner from "../components/StopReachedBanner";
import { generateRouteFromPosition } from "../services/routeService";
import { findAvailableCategories } from "../services/overpassService";

export default function HomeScreen() {
  // DEV STATES
  const [isDevOffRoute, setIsDevOffRoute] = useState(false);


  // Catergory selection state
  const [availableCategories, setAvailableCategories] = useState<RouteCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  //route confirmation
  const [isOffRouteConfirmed, setIsOffRouteConfirmed] = useState(false);

  // Reached banner state
  const [isStopReachedVisible, setIsStopReachedVisible] =
    useState(false);

  // Rerouting state
  const [isRerouting, setIsRerouting] = useState(false);
  const [routeStartPosition, setRouteStartPosition] = useState<RouteCoordinate | null>(null);

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
  const [selectedCategories, setSelectedCategories] =
    useState<RouteCategory[]>([]);

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
    // LOG
    console.log(
      "TURN BY TURN:",
      JSON.stringify(
        result.route.segments.map(
          (segment, segmentIndex) => ({
            segmentIndex,
            instructions: segment.instructions,
          }),
        ),
        null,
        2,
      ),
    );
    // DEV
    console.log("TURN BY TURN LIVE:", {
      currentInstructionIndex,
      currentInstruction,
      distanceToInstructionMeters,
    });
  };

  // DEV TEST
  const simulateDestinationReached = () => {
    handleDestinationReached();
  };
  //

  const handleReroute = async (): Promise<void> => {
    if (
      !currentPosition ||
      isRerouting ||
      !isRouteActive
    ) {
      return;
    }

    try {
      setIsRerouting(true);

      const remainingWaypoints =
        selectedWaypoints.slice(currentStopIndex);

      const remainingWaypointCoordinates =
        remainingWaypoints.map(
          (place) => place.coordinate,
        );

      const destinations: RouteCoordinate[] = [
        ...remainingWaypointCoordinates,
        ...(routeStartPosition
          ? [routeStartPosition]
          : []),
      ];

      if (destinations.length === 0) {
        Alert.alert(
          t("Ingen destination"),
          t(
            "Der er ingen resterende stop at navigere til.",
          ),
        );

        return;
      }

      const route =
        await generateRouteFromPosition(
          currentPosition,
          destinations,
        );

      /*
       * Efter rerouting bliver de resterende
       * waypoints den nye waypoint-liste.
       */
      setSelectedWaypoints(remainingWaypoints);

      setRouteCoordinates(route.coordinates);
      setRouteSegments(route.segments ?? []);
      setRouteDistance(route.distanceMeters);
      setRouteDuration(route.durationSeconds);

      /*
       * Den nye rute starter fra brugerens
       * nuværende position.
       */
      setCurrentStopIndex(0);
      setIsOffRouteConfirmed(false);
      if (__DEV__) {
        setIsDevOffRoute(false);
      }

      if (route.coordinates.length > 0) {
        mapRef.current?.fitToCoordinates(
          [
            ...route.coordinates,
            ...destinations,
          ],
          {
            edgePadding:
              MAP_CONFIG.routeEdgePadding,
            animated: true,
          },
        );
      }
    } catch (error) {
      console.error(
        "Kunne ikke genberegne ruten:",
        error,
      );

      Alert.alert(
        t("Ruten kunne ikke genberegnes"),
        t("Prøv igen om lidt."),
      );
    } finally {
      setIsRerouting(false);
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

    const startPosition =
      currentPosition ?? region;

    if (!startPosition) {
      return;
    }

    mapRef.current?.animateToRegion(
      {
        latitude: startPosition.latitude,
        longitude: startPosition.longitude,

        latitudeDelta:
          MAP_CONFIG.navigation.latitudeDelta,

        longitudeDelta:
          MAP_CONFIG.navigation.longitudeDelta,
      },
      MAP_CONFIG.navigation.animationDurationMs,
    );
  };
  const loadAvailableRouteCategories =
    async (
      origin: RouteCoordinate,
    ): Promise<void> => {
      try {
        setIsLoadingCategories(true);

        const categories =
          await findAvailableCategories(
            origin,
            5000,
          );

        setAvailableCategories(categories);

        /*
         * Hvis en tidligere valgt kategori ikke længere
         * findes i området, fjerner vi den.
         */
        setSelectedCategories(
          (currentCategories) =>
            currentCategories.filter(
              (category) =>
                categories.includes(category),
            ),
        );

        console.log(
          "Tilgængelige kategorier:",
          categories,
        );
      } catch (error) {
        console.error(
          "Kunne ikke hente kategorier:",
          error,
        );

        /*
         * Hvis Overpass fejler, viser vi alle kategorier
         * som fallback, så appen stadig kan bruges.
         */
        setAvailableCategories(
          ROUTE_CATEGORIES.map(
            ({ id }) => id,
          ),
        );
      } finally {
        setIsLoadingCategories(false);
      }
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
    distanceFromRouteMeters,
    isOffRoute,
    locationError: navigationLocationError,
    heading,
    // Turn-by-turn
    currentInstructionIndex,
    currentInstruction,
    distanceToInstructionMeters,
  } = useActiveRouteNavigation({
    isActive: isRouteActive,
    currentStopIndex,
    segments: routeSegments,
    onDestinationReached:
      handleDestinationReached,
  });

  // Næste turn-by-turn instruction
  const currentSegment =
    routeSegments[currentStopIndex];

  const nextInstruction =
    currentSegment?.instructions[
    currentInstructionIndex + 1
    ] ?? null;
  // DEV
  /*
  console.log("TURN BY TURN LIVE:", {
    currentInstructionIndex,
    currentInstruction,
    distanceToInstructionMeters,
  });
  // DEV
  console.log(
    "ACTIVE SEGMENT INSTRUCTIONS:",
    routeSegments[currentStopIndex]?.instructions,
  );
  */
  // DEV TEST

  const effectiveIsOffRoute =
    isOffRoute || (__DEV__ && isDevOffRoute);
  // DEV TEST

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
  /*
  // Bliver ikke brugt lige nu, men nok senere hvis det skalk roteres med retningen
    const navigationHeading =
      heading !== null &&
        Number.isFinite(heading)
        ? heading
        : 0;
  */
  useEffect(() => {
    if (
      !isRouteActive ||
      !currentPosition ||
      isStopReachedVisible
    ) {
      return;
    }

    mapRef.current?.animateToRegion(
      {
        latitude: currentPosition.latitude,
        longitude: currentPosition.longitude,
        latitudeDelta:
          MAP_CONFIG.navigation.latitudeDelta,
        longitudeDelta:
          MAP_CONFIG.navigation.longitudeDelta,
      },
      MAP_CONFIG.navigation.animationDurationMs,
    );
  }, [
    currentPosition,
    isRouteActive,
    isStopReachedVisible,
  ]);

  useEffect(() => {
    if (
      !isRouteActive ||
      !effectiveIsOffRoute ||
      isRerouting
    ) {
      setIsOffRouteConfirmed(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsOffRouteConfirmed(true);
    }, ROUTE_CONFIG.navigation.offRouteConfirmationMs);

    return () => {
      clearTimeout(timer);
    };
  }, [
    effectiveIsOffRoute,
    isRouteActive,
    isRerouting,
  ]);
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

      const currentCoordinate: RouteCoordinate = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setRegion({
        ...currentCoordinate,
        latitudeDelta:
          MAP_CONFIG.initialRegion.latitudeDelta,
        longitudeDelta:
          MAP_CONFIG.initialRegion.longitudeDelta,
      });

      void loadAvailableRouteCategories(
        currentCoordinate,
      );

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
    setRouteStartPosition(origin);
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
      <ImageBackground
        source={require("../assets/images/location-loading.png")}
        style={styles.loadingBackground}
        resizeMode="cover"
      >
        <View style={styles.loadingOverlay}>
          <View className="items-center">
            <Text className="text-3xl font-bold tracking-[6px] text-white">
              ASHRA
            </Text>

            <ActivityIndicator
              size="large"
              color="#ffffff"
              style={{ marginTop: 20 }}
            />

            <Text className="mt-4 text-base font-medium text-white">
              {t("Finder din position...")}
            </Text>

            <Text className="mt-2 text-sm text-blue-100">
              {t("Gør dig klar til at gå")}
            </Text>
          </View>
        </View>
      </ImageBackground>
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
        rotateEnabled
        pitchEnabled
      >

        {selectedWaypoints.map((place, index) => {
          const shouldShowMarker =
            !isRouteActive ||
            index >= currentStopIndex;

          if (!shouldShowMarker) {
            return null;
          }

          return (
            <WaypointMarker
              key={`${place.category}-${place.id}-${index}`}
              place={place}
              stopNumber={index + 1}
              color={getSegmentColor(index)}
            />
          );
        })}

        {routeSegments.length > 0
          ? routeSegments.map((segment, index) => {
            const isCurrentSegment =
              !isRouteActive ||
              index === currentStopIndex;

            return (
              <Polyline
                key={`route-segment-${index}`}
                coordinates={segment.coordinates}
                strokeWidth={
                  isCurrentSegment
                    ? MAP_CONFIG.routeStrokeWidth
                    : MAP_CONFIG.routeStrokeWidth - 2
                }
                strokeColor={getSegmentStrokeColor(
                  index,
                  isCurrentSegment,
                  isRouteActive,
                )}
                lineCap="round"
                lineJoin="round"
              />
            );
          })
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

      {/* DEV: simulér stop nået */}
      {__DEV__ && isRouteActive && (
        <Pressable
          onPress={simulateDestinationReached}
          className="absolute bottom-40 right-4 z-50 rounded-xl bg-purple-600 px-4 py-3"
        >
          <Text className="font-bold text-white">
            Test stop nået
          </Text>
        </Pressable>
      )}

      {/* DEV: simulér off-route */}
      {__DEV__ && isRouteActive && (
        <Pressable
          onPress={() =>
            setIsDevOffRoute(
              (current) => !current,
            )
          }
          className={[
            "absolute bottom-56 right-4 z-50 rounded-xl px-4 py-3",
            isDevOffRoute
              ? "bg-green-600"
              : "bg-purple-600",
          ].join(" ")}
        >
          <Text className="font-bold text-white">
            {isDevOffRoute
              ? "Test: På ruten"
              : "Test: Off-route"}
          </Text>
        </Pressable>
      )}

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
          !isRouteActive &&
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
        isVisible={
          isRouteActive &&
          !isStopReachedVisible
        }
        currentStopIndex={currentStopIndex}
        waypoints={selectedWaypoints}
        segments={routeSegments}
        distanceToNextStopMeters={
          distanceToNextStopMeters
        }
        locationError={navigationLocationError}
        isOffRoute={effectiveIsOffRoute} //isOffRoute={isOffRoute} dette var original
        isOffRouteConfirmed={isOffRouteConfirmed}
        isRerouting={isRerouting}
        onReroute={handleReroute}
        onNextStop={handleNextStop}
        onStopRoute={handleStopRoute}
        // Turn by turn
        currentInstruction={currentInstruction}
        currentInstructionIndex={currentInstructionIndex}
        distanceToInstructionMeters={distanceToInstructionMeters}
        nextInstruction={
          nextInstruction
        }
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
          availableCategories={availableCategories}
          isLoadingCategories={isLoadingCategories}
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  loadingOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 20, 70, 0.12)",
  },
});
