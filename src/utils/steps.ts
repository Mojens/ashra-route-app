export function stepsToKm(steps: number): number {
  return Number((steps * 0.00075).toFixed(1));
}

export function stepsToMinutes(steps: number): number {
  return Math.round(steps / 110);
}