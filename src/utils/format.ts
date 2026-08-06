export function formatSteps(steps: number): string {
  return steps.toLocaleString("da-DK");
}

export function formatDistanceKm(
  distanceMeters: number,
): string {
  return `${(distanceMeters / 1000).toFixed(1)} km`;
}

export function formatDurationMinutes(
  durationSeconds: number,
): string {
  return `${Math.round(durationSeconds / 60)} min`;
}