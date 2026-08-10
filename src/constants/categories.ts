import { RouteCategory } from "../types/route";

export type RouteCategoryGroup =
  | "nature"
  | "food"
  | "experiences"
  | "shopping"
  | "sport"
  | "practical";

export interface RouteCategoryConfig {
  id: RouteCategory;
  label: string;
  icon: string;
  group: RouteCategoryGroup;

  osm: {
    key: string;
    value: string;
  };
}

export const ROUTE_CATEGORY_GROUPS = [
  {
    id: "nature",
    label: "Natur",
    icon: "🌿",
  },
  {
    id: "food",
    label: "Mad & drikke",
    icon: "🍴",
  },
  {
    id: "experiences",
    label: "Oplevelser",
    icon: "🎭",
  },
  {
    id: "shopping",
    label: "Shopping",
    icon: "🛍️",
  },
  {
    id: "sport",
    label: "Sport & fritid",
    icon: "⚽",
  },
  {
    id: "practical",
    label: "Praktisk",
    icon: "📍",
  },
] as const;

export const ROUTE_CATEGORIES: RouteCategoryConfig[] = [
  {
    id: "park",
    label: "Park",
    icon: "🌳",
    group: "nature",
    osm: {
      key: "leisure",
      value: "park",
    },
  },
  {
    id: "beach",
    label: "Strand",
    icon: "🏖️",
    group: "nature",
    osm: {
      key: "natural",
      value: "beach",
    },
  },
  {
    id: "supermarket",
    label: "Supermarked",
    icon: "🛒",
    group: "shopping",
    osm: {
      key: "shop",
      value: "supermarket",
    },
  },
  {
    id: "cafe",
    label: "Café",
    icon: "☕",
    group: "food",
    osm: {
      key: "amenity",
      value: "cafe",
    },
  },
  {
    id: "restaurant",
    label: "Restaurant",
    icon: "🍽️",
    group: "food",
    osm: {
      key: "amenity",
      value: "restaurant",
    },
  },
  {
    id: "bakery",
    label: "Bageri",
    icon: "🥐",
    group: "food",
    osm: {
      key: "shop",
      value: "bakery",
    },
  },
  {
    id: "pharmacy",
    label: "Apotek",
    icon: "💊",
    group: "practical",
    osm: {
      key: "amenity",
      value: "pharmacy",
    },
  },
  {
    id: "playground",
    label: "Legeplads",
    icon: "🛝",
    group: "nature",
    osm: {
      key: "leisure",
      value: "playground",
    },
  },
  {
    id: "museum",
    label: "Museum",
    icon: "🏛️",
    group: "experiences",
    osm: {
      key: "tourism",
      value: "museum",
    },
  },
  {
    id: "library",
    label: "Bibliotek",
    icon: "📚",
    group: "experiences",
    osm: {
      key: "amenity",
      value: "library",
    },
  },
  {
    id: "cinema",
    label: "Biograf",
    icon: "🎬",
    group: "experiences",
    osm: {
      key: "amenity",
      value: "cinema",
    },
  },
  {
    id: "fitness",
    label: "Fitness",
    icon: "🏋️",
    group: "sport",
    osm: {
      key: "leisure",
      value: "fitness_centre",
    },
  },
  {
    id: "shoppingMall",
    label: "Shoppingcenter",
    icon: "🛍️",
    group: "shopping",
    osm: {
      key: "shop",
      value: "mall",
    },
  },
  {
    id: "viewpoint",
    label: "Udsigtspunkt",
    icon: "👀",
    group: "experiences",
    osm: {
      key: "tourism",
      value: "viewpoint",
    },
  },
  {
    id: "fastFood",
    label: "Fastfood",
    icon: "🍔",
    group: "food",
    osm: {
      key: "amenity",
      value: "fast_food",
    },
  },
  {
    id: "iceCream",
    label: "Is",
    icon: "🍦",
    group: "food",
    osm: {
      key: "amenity",
      value: "ice_cream",
    },
  },
  {
    id: "bar",
    label: "Bar",
    icon: "🍸",
    group: "food",
    osm: {
      key: "amenity",
      value: "bar",
    },
  },
  {
    id: "pub",
    label: "Pub",
    icon: "🍺",
    group: "food",
    osm: {
      key: "amenity",
      value: "pub",
    },
  },
  {
    id: "convenience",
    label: "Kiosk",
    icon: "🏪",
    group: "shopping",
    osm: {
      key: "shop",
      value: "convenience",
    },
  },
  {
    id: "clothes",
    label: "Tøjbutik",
    icon: "👕",
    group: "shopping",
    osm: {
      key: "shop",
      value: "clothes",
    },
  },
  {
    id: "books",
    label: "Boghandel",
    icon: "📖",
    group: "shopping",
    osm: {
      key: "shop",
      value: "books",
    },
  },
  {
    id: "sportsShop",
    label: "Sportsbutik",
    icon: "⚽",
    group: "shopping",
    osm: {
      key: "shop",
      value: "sports",
    },
  },
  {
    id: "gardenCentre",
    label: "Havecenter",
    icon: "🪴",
    group: "shopping",
    osm: {
      key: "shop",
      value: "garden_centre",
    },
  },
  {
    id: "forest",
    label: "Skov",
    icon: "🌲",
    group: "nature",
    osm: {
      key: "landuse",
      value: "forest",
    },
  },
  {
    id: "natureReserve",
    label: "Naturreservat",
    icon: "🌿",
    group: "nature",
    osm: {
      key: "leisure",
      value: "nature_reserve",
    },
  },
  {
    id: "picnicSite",
    label: "Picnicområde",
    icon: "🧺",
    group: "nature",
    osm: {
      key: "tourism",
      value: "picnic_site",
    },
  },
  {
    id: "dogPark",
    label: "Hundepark",
    icon: "🐕",
    group: "nature",
    osm: {
      key: "leisure",
      value: "dog_park",
    },
  },
  {
    id: "sportsCentre",
    label: "Sportscenter",
    icon: "🏃",
    group: "sport",
    osm: {
      key: "leisure",
      value: "sports_centre",
    },
  },
  {
    id: "swimmingPool",
    label: "Svømmehal",
    icon: "🏊",
    group: "sport",
    osm: {
      key: "leisure",
      value: "swimming_pool",
    },
  },
  {
    id: "stadium",
    label: "Stadion",
    icon: "🏟️",
    group: "sport",
    osm: {
      key: "leisure",
      value: "stadium",
    },
  },
  {
    id: "attraction",
    label: "Seværdighed",
    icon: "⭐",
    group: "experiences",
    osm: {
      key: "tourism",
      value: "attraction",
    },
  },
  {
    id: "monument",
    label: "Monument",
    icon: "🗿",
    group: "experiences",
    osm: {
      key: "historic",
      value: "monument",
    },
  },
  {
    id: "artwork",
    label: "Kunstværk",
    icon: "🎨",
    group: "experiences",
    osm: {
      key: "tourism",
      value: "artwork",
    },
  },
  {
    id: "gallery",
    label: "Galleri",
    icon: "🖼️",
    group: "experiences",
    osm: {
      key: "tourism",
      value: "gallery",
    },
  },
  {
    id: "zoo",
    label: "Zoo",
    icon: "🦁",
    group: "experiences",
    osm: {
      key: "tourism",
      value: "zoo",
    },
  },
  {
    id: "castle",
    label: "Slot",
    icon: "🏰",
    group: "experiences",
    osm: {
      key: "historic",
      value: "castle",
    },
  },
  {
    id: "toilets",
    label: "Toilet",
    icon: "🚻",
    group: "practical",
    osm: {
      key: "amenity",
      value: "toilets",
    },
  },
  {
    id: "drinkingWater",
    label: "Drikkevand",
    icon: "🚰",
    group: "practical",
    osm: {
      key: "amenity",
      value: "drinking_water",
    },
  },
];

export const CATEGORY_LABELS: Record<
  RouteCategory,
  string
> = Object.fromEntries(
  ROUTE_CATEGORIES.map((category) => [
    category.id,
    category.label,
  ]),
) as Record<RouteCategory, string>;