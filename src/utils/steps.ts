import { STEP_CONFIG } from "../constants";

export function stepsToKm(steps: number): number {
  const distanceKm =
    steps * STEP_CONFIG.estimatedStepLengthKm;

  return Number(distanceKm.toFixed(1));
}

export function stepsToMinutes(steps: number): number {
  return Math.round(
    steps / STEP_CONFIG.estimatedStepsPerMinute,
  );
}