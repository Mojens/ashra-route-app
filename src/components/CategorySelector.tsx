import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ROUTE_FILTERS } from "../constants/filters";
import { RouteCategory } from "../types/route";
import React from "react";

interface FilterSelectorProps {
  selectedFilters: RouteCategory[];
  onToggleFilter: (filter: RouteCategory) => void;
}

export default function FilterSelector({
  selectedFilters,
  onToggleFilter,
}: FilterSelectorProps) {
  return (
    <View>
      <Text style={styles.title}>Hvad skal ruten gå forbi?</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {ROUTE_FILTERS.map((filter) => {
          const isSelected = selectedFilters.includes(filter.id);

          return (
            <Pressable
              key={filter.id}
              style={[
                styles.filterButton,
                isSelected && styles.selectedFilterButton,
              ]}
              onPress={() => onToggleFilter(filter.id)}
            >
              <Text style={styles.icon}>{filter.icon}</Text>

              <Text
                style={[
                  styles.label,
                  isSelected && styles.selectedLabel,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  container: {
    gap: 10,
  },
  filterButton: {
    minWidth: 100,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },
  selectedFilterButton: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  icon: {
    marginBottom: 5,
    fontSize: 22,
  },
  label: {
    fontSize: 14,
    color: "#374151",
  },
  selectedLabel: {
    color: "#2563EB",
    fontWeight: "600",
  },
});