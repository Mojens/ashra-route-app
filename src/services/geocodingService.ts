import axios from "axios";

import { RouteCoordinate } from "../types/route";

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
): Promise<string | null> {
  try {
    const response = await axios.get<NominatimResponse>(
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

    const road =
      address?.road ??
      address?.pedestrian ??
      address?.footway;

    if (road) {
      return `Park ved ${road}`;
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
      return `Park i ${area}`;
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