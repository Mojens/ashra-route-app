import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { ROUTE_FILTERS } from "../constants/filters";
import { RouteCategory } from "../types/route";

interface CategorySelectorProps {
  selectedCategories: RouteCategory[];
  onToggleCategory: (category: RouteCategory) => void;
  onMoveCategory: (
    category: RouteCategory,
    direction: "left" | "right",
  ) => void;
}

export default function CategorySelector({
  selectedCategories,
  onToggleCategory,
  onMoveCategory,
}: CategorySelectorProps) {
  return (
    <View>
      <Text className="mb-3 text-base font-semibold text-slate-900">
        Hvad skal ruten gå forbi?
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2"
      >
        {ROUTE_FILTERS.map((category) => {
          const selectedIndex =
            selectedCategories.indexOf(category.id);

          const isSelected = selectedIndex !== -1;

          return (
            <Pressable
              key={category.id}
              onPress={() =>
                onToggleCategory(category.id)
              }
              className={[
                "min-w-[110px] rounded-2xl border p-3",
                isSelected
                  ? "border-blue-600 bg-blue-50"
                  : "border-slate-200 bg-white",
              ].join(" ")}
            >
              <View className="flex-row items-start justify-between">
                <Text className="text-2xl">
                  {category.icon}
                </Text>

                {isSelected && (
                  <View className="rounded-full bg-blue-600 px-2 py-1">
                    <Text className="text-[10px] font-bold text-white">
                      STOP {selectedIndex + 1}
                    </Text>
                  </View>
                )}
              </View>

              <Text
                className={[
                  "mt-2 text-sm",
                  isSelected
                    ? "font-semibold text-blue-700"
                    : "font-medium text-slate-700",
                ].join(" ")}
              >
                {category.label}
              </Text>

              {isSelected &&
                selectedCategories.length > 1 && (
                  <View className="mt-3 flex-row gap-2">
                    <Pressable
                      disabled={selectedIndex === 0}
                      onPress={(event) => {
                        event.stopPropagation();

                        onMoveCategory(
                          category.id,
                          "left",
                        );
                      }}
                      className={[
                        "flex-1 items-center rounded-lg py-1.5",
                        selectedIndex === 0
                          ? "bg-slate-100"
                          : "bg-white active:bg-slate-100",
                      ].join(" ")}
                    >
                      <Text
                        className={
                          selectedIndex === 0
                            ? "text-slate-300"
                            : "font-bold text-blue-600"
                        }
                      >
                        ←
                      </Text>
                    </Pressable>

                    <Pressable
                      disabled={
                        selectedIndex ===
                        selectedCategories.length - 1
                      }
                      onPress={(event) => {
                        event.stopPropagation();

                        onMoveCategory(
                          category.id,
                          "right",
                        );
                      }}
                      className={[
                        "flex-1 items-center rounded-lg py-1.5",
                        selectedIndex ===
                        selectedCategories.length - 1
                          ? "bg-slate-100"
                          : "bg-white active:bg-slate-100",
                      ].join(" ")}
                    >
                      <Text
                        className={
                          selectedIndex ===
                          selectedCategories.length - 1
                            ? "text-slate-300"
                            : "font-bold text-blue-600"
                        }
                      >
                        →
                      </Text>
                    </Pressable>
                  </View>
                )}
            </Pressable>
          );
        })}
      </ScrollView>

      {selectedCategories.length > 1 && (
        <Text className="mt-2 text-xs text-slate-500">
          Brug pilene til at ændre rækkefølgen på
          stoppene.
        </Text>
      )}
    </View>
  );
}