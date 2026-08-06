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
import { useNearbyPlaces } from "../hooks/useNearbyPlaces";
import {
  PointOfInterest,
  RouteCategory,
  RouteCoordinate,
} from "../types/route";
import {
  buildCandidateRoutes,
  planBestRoute,
} from "../services/routePlanner";
import { stepsToKm } from "../utils/steps";
import { getLocationDescription } from "../services/geocodingService";

export default function HomeScreen() {
  const mapRef = useRef<MapView>(null);

  const [region, setRegion] = useState<Region | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedSteps, setSelectedSteps] = useState(10000);

  const [selectedCategories, setSelectedCategories] = useState<
    RouteCategory[]
  >(["park"]);

  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isGeneratingRoute, setIsGeneratingRoute] = useState(false);

  const [routeCoordinates, setRouteCoordinates] = useState<
    RouteCoordinate[]
  >([]);

  const [routeDistance, setRouteDistance] = useState<number | null>(
    null,
  );

  const [routeDuration, setRouteDuration] = useState<number | null>(
    null,
  );

  const [selectedPlace, setSelectedPlace] =
    useState<PointOfInterest | null>(null);

  const {
    loadPlaces,
    loadingCategories,
    error: nearbyPlacesError,
  } = useNearbyPlaces();

  const isLoadingPlaces = loadingCategories.length > 0;
  const isBusy = isGeneratingRoute || isLoadingPlaces;

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

    if (!selectedCategories.includes("park")) {
      Alert.alert(
        "Vælg park",
        "Vælg Park for at generere denne rute.",
      );

      return;
    }

    const start: RouteCoordinate = {
      latitude: region.latitude,
      longitude: region.longitude,
    };

    try {
      setIsGeneratingRoute(true);

      const targetDistanceMeters =
        stepsToKm(selectedSteps) * 1000;

      const searchRadiusMeters = Math.min(
        8000,
        Math.max(
          3000,
          Math.ceil(targetDistanceMeters / 2),
        ),
      );

      const parks = await loadPlaces(
        start,
        "park",
        searchRadiusMeters,
      );

      if (parks.length === 0) {
        Alert.alert(
          "Ingen park fundet",
          `Vi kunne ikke finde en park inden for ${(
            searchRadiusMeters / 1000
          ).toFixed(1)} km.`,
        );

        return;
      }

      const candidateRoutes = buildCandidateRoutes({
        selectedCategories: ["park"],
        placesByCategory: {
          park: parks,
        },
        placesPerCategory: 5,
        maximumRoutes: 10,
      });

      if (candidateRoutes.length === 0) {
        Alert.alert(
          "Ingen rutemuligheder",
          "Vi kunne ikke bygge nogen mulige ruter.",
        );

        return;
      }

      const plannedRoute = await planBestRoute({
        origin: start,
        candidates: candidateRoutes,
        targetDistanceMeters,
        candidateLimit: 3,
      });

      if (!plannedRoute) {
        Alert.alert(
          "Ingen rute fundet",
          "Vi kunne ikke generere en passende rute.",
        );

        return;
      }

      const route = plannedRoute.route;
      const selectedWaypoints = plannedRoute.waypoints;
      const selectedPark = selectedWaypoints[0]?.place;

      if (!selectedPark) {
        Alert.alert(
          "Ingen destination fundet",
          "Ruten indeholder ingen gyldig destination.",
        );

        return;
      }

      const parkName =
        selectedPark.name !== "Park"
          ? selectedPark.name
          : await getLocationDescription(
            selectedPark.coordinate,
          );

      const namedPark: PointOfInterest = {
        ...selectedPark,
        name: parkName ?? "Park",
      };

      console.log("Valgt rute:", {
        targetKm: targetDistanceMeters / 1000,
        actualKm: route.distanceMeters / 1000,
        differenceKm:
          plannedRoute.differenceMeters / 1000,
        waypoints: selectedWaypoints.map(
          (waypoint) => ({
            category: waypoint.category,
            name: waypoint.place.name,
          }),
        ),
      });

      setSelectedPlace(namedPark);
      setRouteCoordinates(route.coordinates);
      setRouteDistance(route.distanceMeters);
      setRouteDuration(route.durationSeconds);
      setIsPanelCollapsed(true);

      mapRef.current?.fitToCoordinates(
        [
          ...route.coordinates,
          ...selectedWaypoints.map(
            (waypoint) =>
              waypoint.place.coordinate,
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
        nearbyPlacesError ??
        (error instanceof Error
          ? error.message
          : "Der opstod en ukendt fejl.");

      Alert.alert(
        "Ruten kunne ikke genereres",
        message,
      );
    } finally {
      setIsGeneratingRoute(false);
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
        {selectedPlace && (
          <Marker
            coordinate={selectedPlace.coordinate}
            title={selectedPlace.name}
            description="Park på din rute"
            pinColor="green"
          />
        )}

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