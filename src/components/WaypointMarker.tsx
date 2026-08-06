import { Text, View } from "react-native";
import { Marker } from "react-native-maps";

import {
  PointOfInterest,
  RouteCategory,
} from "../types/route";

interface WaypointMarkerProps {
  place: PointOfInterest;
  stopNumber: number;
  color: string;
}

export default function WaypointMarker({
  place,
  stopNumber,
  color,
}: WaypointMarkerProps) {
  return (
    <Marker
      coordinate={place.coordinate}
      title={`Stop ${stopNumber}: ${place.name}`}
      description={getCategoryLabel(place.category)}
      anchor={{ x: 0.5, y: 1 }}
      tracksViewChanges={false}
    >
      <View className="items-center">
        <View
          style={{ backgroundColor: color }}
          className="h-10 w-10 items-center justify-center rounded-full border-2 border-white shadow-lg"
        >
          <Text className="text-base font-bold text-white">
            {stopNumber}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: color,
            transform: [{ rotate: "45deg" }],
          }}
          className="-mt-2 h-4 w-4 border-b-2 border-r-2 border-white"
        />
      </View>
    </Marker>
  );
}

function getCategoryLabel(
  category: RouteCategory,
): string {
  switch (category) {
    case "park":
      return "Park";

    case "beach":
      return "Strand";

    case "supermarket":
      return "Supermarked";
  }
}