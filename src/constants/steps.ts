export const STEP_OPTIONS = [
  5000,
  7500,
  10000,
  15000,
] as const;

export const STEP_CONFIG = {
  defaultSteps: 10000,
  estimatedStepLengthKm: 0.00075,
  estimatedStepsPerMinute: 110,
} as const;