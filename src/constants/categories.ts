import { RouteCategory } from "../types/route";

export interface RouteCategoryConfig {
  id: RouteCategory;
  label: string;
  icon: string;

  osm: {
    key: string;
    value: string;
  };
}

export const ROUTE_CATEGORIES: RouteCategoryConfig[] = [
  {
    id: "park",
    label: "Park",
    icon: "🌳",
    osm: {
      key: "leisure",
      value: "park",
    },
  },
  {
    id: "beach",
    label: "Strand",
    icon: "🏖️",
    osm: {
      key: "natural",
      value: "beach",
    },
  },
  {
    id: "supermarket",
    label: "Supermarked",
    icon: "🛒",
    osm: {
      key: "shop",
      value: "supermarket",
    },
  },
  {
    id: "cafe",
    label: "Café",
    icon: "☕",
    osm: {
      key: "amenity",
      value: "cafe",
    },
  },
  {
    id: "restaurant",
    label: "Restaurant",
    icon: "🍽️",
    osm: {
      key: "amenity",
      value: "restaurant",
    },
  },
  {
    id: "bakery",
    label: "Bageri",
    icon: "🥐",
    osm: {
      key: "shop",
      value: "bakery",
    },
  },
  {
    id: "pharmacy",
    label: "Apotek",
    icon: "💊",
    osm: {
      key: "amenity",
      value: "pharmacy",
    },
  },
  {
    id: "playground",
    label: "Legeplads",
    icon: "🛝",
    osm: {
      key: "leisure",
      value: "playground",
    },
  },
  {
    id: "museum",
    label: "Museum",
    icon: "🏛️",
    osm: {
      key: "tourism",
      value: "museum",
    },
  },
  {
    id: "library",
    label: "Bibliotek",
    icon: "📚",
    osm: {
      key: "amenity",
      value: "library",
    },
  },
  {
    id: "cinema",
    label: "Biograf",
    icon: "🎬",
    osm: {
      key: "amenity",
      value: "cinema",
    },
  },
  {
    id: "fitness",
    label: "Fitness",
    icon: "🏋️",
    osm: {
      key: "leisure",
      value: "fitness_centre",
    },
  },
  {
    id: "shoppingMall",
    label: "Shoppingcenter",
    icon: "🛍️",
    osm: {
      key: "shop",
      value: "mall",
    },
  },
  {
    id: "viewpoint",
    label: "Udsigtspunkt",
    icon: "👀",
    osm: {
      key: "tourism",
      value: "viewpoint",
    },
  },
];

/**
 * Beholdes fordi flere komponenter bruger:
 *
 * CATEGORY_LABELS[category]
 */
export const CATEGORY_LABELS: Record<
  RouteCategory,
  string
> = Object.fromEntries(
  ROUTE_CATEGORIES.map((category) => [
    category.id,
    category.label,
  ]),
) as Record<RouteCategory, string>;