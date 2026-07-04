export interface VramEstimate {
  vramQ4: number;
  vramQ8: number;
  ramMin: number;
}

const BITS_PER_WEIGHT_Q4 = 4.5;
const BITS_PER_WEIGHT_Q8 = 8.0;
const OVERHEAD = 1.1;

export function estimateVram(parametersB: number): VramEstimate {
  const vramQ4 = +(parametersB * BITS_PER_WEIGHT_Q4 / 8 * OVERHEAD).toFixed(1);
  const vramQ8 = +(parametersB * BITS_PER_WEIGHT_Q8 / 8 * OVERHEAD).toFixed(1);
  const ramMin = +(parametersB * BITS_PER_WEIGHT_Q4 / 8 * 1.5).toFixed(1);

  return { vramQ4, vramQ8, ramMin };
}
