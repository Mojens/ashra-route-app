import axios from "axios";
import { RouteCategory, RouteCoordinate } from "../types/route";
import { CATEGORY_LABELS } from "../constants";

interface NominatimAddress {
  road?: string;
  pedestrian?: string;
  footway?: string;
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
}

interface NominatimResponse {
  display_name?: string;
  name?: string;
  address?: NominatimAddress;
}

const NOMINATIM_URL =
  "https://nominatim.openstreetmap.org/reverse";

export async function getLocationDescription(
  coordinate: RouteCoordinate,
  category: RouteCategory,
): Promise<string | null> {
  try {
    const response =
      await axios.get<NominatimResponse>(
        NOMINATIM_URL,
        {
          params: {
            lat: coordinate.latitude,
            lon: coordinate.longitude,
            format: "jsonv2",
            addressdetails: 1,
            zoom: 18,
            "accept-language": "da",
          },
          headers: {
            Accept: "application/json",
          },
          timeout: 10000,
        },
      );

    const address = response.data.address;

    const categoryLabel =
      CATEGORY_LABELS[category];

    const road =
      address?.road ??
      address?.pedestrian ??
      address?.footway;

    if (road) {
      return `${categoryLabel} ved ${road}`;
    }

    const area =
      address?.neighbourhood ??
      address?.suburb ??
      address?.quarter ??
      address?.city_district ??
      address?.city ??
      address?.town ??
      address?.village;

    if (area) {
      return `${categoryLabel} i ${area}`;
    }

    return null;
  } catch (error) {
    console.warn(
      "Kunne ikke hente beskrivelse af stedet:",
      error,
    );

    return null;
  }
}