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
  Marker,
  Polyline,
  Region,
} from "react-native-maps";
import * as Location from "expo-location";

import RoutePanel from "../components/RoutePanel";
import {
  PointOfInterest,
  RouteCategory,
  RouteCoordinate,
} from "../types/route";
import { useRoutePlanner } from "../hooks/useRoutePlanner";

export default function HomeScreen() {
  const mapRef = useRef<MapView>(null);

  const [region, setRegion] = useState<Region | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedSteps, setSelectedSteps] = useState(10000);

  const [selectedCategories, setSelectedCategories] = useState<
    RouteCategory[]
  >(["park"]);

  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  const [routeCoordinates, setRouteCoordinates] = useState<
    RouteCoordinate[]
  >([]);

  const [routeDistance, setRouteDistance] = useState<number | null>(
    null,
  );

  const [routeDuration, setRouteDuration] = useState<number | null>(
    null,
  );

  const [selectedWaypoints, setSelectedWaypoints] = useState<
    PointOfInterest[]
  >([]);

  const {
    generateRoutePlan,
    isBusy,
    errorMessage: routePlannerError,
  } = useRoutePlanner();

  useEffect(() => {
    loadCurrentLocation();
  }, []);

  const loadCurrentLocation = async () => {
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

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
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
  ) => {
    setSelectedCategories((currentCategories) =>
      currentCategories.includes(category)
        ? currentCategories.filter(
          (currentCategory) =>
            currentCategory !== category,
        )
        : [...currentCategories, category],
    );
  };

  const handleGenerateRoute = async () => {
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

      const waypointPlaces = result.waypoints.map(
        ({ place }) => place,
      );

      setSelectedWaypoints(waypointPlaces);
      setRouteCoordinates(result.route.coordinates);
      setRouteDistance(result.route.distanceMeters);
      setRouteDuration(result.route.durationSeconds);
      setIsPanelCollapsed(true);

      console.log("Valgt rute:", {
        targetKm:
          result.targetDistanceMeters / 1000,
        actualKm:
          result.route.distanceMeters / 1000,
        differenceKm:
          result.differenceMeters / 1000,
        waypoints: result.waypoints.map(
          ({ category, place }) => ({
            category,
            name: place.name,
          }),
        ),
      });

      mapRef.current?.fitToCoordinates(
        [
          ...result.route.coordinates,
          ...result.waypoints.map(
            ({ place }) => place.coordinate,
          ),
        ],
        {
          edgePadding: {
            top: 80,
            right: 50,
            bottom: 180,
            left: 50,
          },
          animated: true,
        },
      );
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
          onPress={loadCurrentLocation}
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
          <Marker
            key={`${place.category}-${place.id}-${index}`}
            coordinate={place.coordinate}
            title={place.name}
            description={getWaypointDescription(
              place.category,
              index,
            )}
            pinColor={getMarkerColor(place.category)}
          />
        ))}

        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={5}
            strokeColor="#2563EB"
          />
        )}
      </MapView>

      <RoutePanel
        selectedSteps={selectedSteps}
        selectedFilters={selectedCategories}
        isCollapsed={isPanelCollapsed}
        isGeneratingRoute={isBusy}
        routeDistance={routeDistance}
        routeDuration={routeDuration}
        onSelectSteps={setSelectedSteps}
        onToggleFilter={toggleCategory}
        onToggleCollapsed={() =>
          setIsPanelCollapsed(
            (current) => !current,
          )
        }
        onGenerateRoute={handleGenerateRoute}
      />
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

function getWaypointDescription(
  category: RouteCategory,
  index: number,
): string {
  const stopNumber = index + 1;

  switch (category) {
    case "park":
      return `Stop ${stopNumber}: Park`;

    case "beach":
      return `Stop ${stopNumber}: Strand`;

    case "supermarket":
      return `Stop ${stopNumber}: Supermarked`;
  }
}

function getMarkerColor(
  category: RouteCategory,
): string {
  switch (category) {
    case "park":
      return "green";

    case "beach":
      return "blue";

    case "supermarket":
      return "orange";
  }
}