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
import { generateRoundTripRoute } from "../services/routeService";
import {
  PointOfInterest,
  RouteCategory,
  RouteCoordinate,
} from "../types/route";
import { chooseBestDestination } from "../services/routePlanner";
import { stepsToKm } from "../utils/steps";

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

      const plannedDestination =
        chooseBestDestination(
          start,
          parks,
          selectedSteps,
        );

      if (!plannedDestination) {
        Alert.alert(
          "Ingen park fundet",
          `Vi kunne ikke finde en park inden for ${(
            searchRadiusMeters / 1000
          ).toFixed(1)} km.`,
        );

        return;
      }

      const park = plannedDestination.place;

      const route = await generateRoundTripRoute(
        start,
        park.coordinate,
      );

      setSelectedPlace(park);
      setRouteCoordinates(route.coordinates);
      setRouteDistance(route.distanceMeters);
      setRouteDuration(route.durationSeconds);
      setIsPanelCollapsed(true);

      mapRef.current?.fitToCoordinates(
        [...route.coordinates, park.coordinate],
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