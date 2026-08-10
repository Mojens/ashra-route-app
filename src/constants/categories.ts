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
  {
    id: "fastFood",
    label: "Fastfood",
    icon: "🍔",
    osm: {
      key: "amenity",
      value: "fast_food",
    },
  },
  {
    id: "iceCream",
    label: "Is",
    icon: "🍦",
    osm: {
      key: "amenity",
      value: "ice_cream",
    },
  },
  {
    id: "bar",
    label: "Bar",
    icon: "🍸",
    osm: {
      key: "amenity",
      value: "bar",
    },
  },
  {
    id: "pub",
    label: "Pub",
    icon: "🍺",
    osm: {
      key: "amenity",
      value: "pub",
    },
  },
  {
    id: "convenience",
    label: "Kiosk",
    icon: "🏪",
    osm: {
      key: "shop",
      value: "convenience",
    },
  },
  {
    id: "clothes",
    label: "Tøjbutik",
    icon: "👕",
    osm: {
      key: "shop",
      value: "clothes",
    },
  },
  {
    id: "books",
    label: "Boghandel",
    icon: "📖",
    osm: {
      key: "shop",
      value: "books",
    },
  },
  {
    id: "sportsShop",
    label: "Sportsbutik",
    icon: "⚽",
    osm: {
      key: "shop",
      value: "sports",
    },
  },
  {
    id: "gardenCentre",
    label: "Havecenter",
    icon: "🪴",
    osm: {
      key: "shop",
      value: "garden_centre",
    },
  },
  {
    id: "forest",
    label: "Skov",
    icon: "🌲",
    osm: {
      key: "landuse",
      value: "forest",
    },
  },
  {
    id: "natureReserve",
    label: "Naturreservat",
    icon: "🌿",
    osm: {
      key: "leisure",
      value: "nature_reserve",
    },
  },
  {
    id: "picnicSite",
    label: "Picnicområde",
    icon: "🧺",
    osm: {
      key: "tourism",
      value: "picnic_site",
    },
  },
  {
    id: "dogPark",
    label: "Hundepark",
    icon: "🐕",
    osm: {
      key: "leisure",
      value: "dog_park",
    },
  },
  {
    id: "sportsCentre",
    label: "Sportscenter",
    icon: "🏃",
    osm: {
      key: "leisure",
      value: "sports_centre",
    },
  },
  {
    id: "swimmingPool",
    label: "Svømmehal",
    icon: "🏊",
    osm: {
      key: "leisure",
      value: "swimming_pool",
    },
  },
  {
    id: "stadium",
    label: "Stadion",
    icon: "🏟️",
    osm: {
      key: "leisure",
      value: "stadium",
    },
  },
  {
    id: "attraction",
    label: "Seværdighed",
    icon: "⭐",
    osm: {
      key: "tourism",
      value: "attraction",
    },
  },
  {
    id: "monument",
    label: "Monument",
    icon: "🗿",
    osm: {
      key: "historic",
      value: "monument",
    },
  },
  {
    id: "artwork",
    label: "Kunstværk",
    icon: "🎨",
    osm: {
      key: "tourism",
      value: "artwork",
    },
  },
  {
    id: "gallery",
    label: "Galleri",
    icon: "🖼️",
    osm: {
      key: "tourism",
      value: "gallery",
    },
  },
  {
    id: "zoo",
    label: "Zoo",
    icon: "🦁",
    osm: {
      key: "tourism",
      value: "zoo",
    },
  },
  {
    id: "castle",
    label: "Slot",
    icon: "🏰",
    osm: {
      key: "historic",
      value: "castle",
    },
  },
  {
    id: "toilets",
    label: "Toilet",
    icon: "🚻",
    osm: {
      key: "amenity",
      value: "toilets",
    },
  },
  {
    id: "drinkingWater",
    label: "Drikkevand",
    icon: "🚰",
    osm: {
      key: "amenity",
      value: "drinking_water",
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