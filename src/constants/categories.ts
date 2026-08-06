import {
  RouteCategory,
  RouteFilterOption,
} from "../types/route";

export const ROUTE_CATEGORIES: RouteFilterOption[] = [
  {
    id: "park",
    label: "Park",
    icon: "🌳",
  },
  {
    id: "beach",
    label: "Strand",
    icon: "🏖️",
  },
  {
    id: "supermarket",
    label: "Supermarked",
    icon: "🛒",
  },
];

export const CATEGORY_LABELS: Record<
  RouteCategory,
  string
> = {
  park: "Park",
  beach: "Strand",
  supermarket: "Supermarked",
};