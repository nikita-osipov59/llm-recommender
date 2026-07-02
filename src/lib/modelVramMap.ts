export interface VramInfo {
  vramQ4: number;
  vramQ8: number;
  ramMin: number;
}

const vramMap: Record<string, VramInfo> = {
  "Llama 3.1 8B": { vramQ4: 5, vramQ8: 9, ramMin: 8 },
  "Llama 3.1 70B": { vramQ4: 40, vramQ8: 75, ramMin: 48 },
  "Llama 3.2 1B": { vramQ4: 0.8, vramQ8: 1.5, ramMin: 4 },
  "Llama 3.2 3B": { vramQ4: 2, vramQ8: 4, ramMin: 4 },
  "Mistral 7B": { vramQ4: 4.5, vramQ8: 8, ramMin: 8 },
  "Mistral Nemo 12B": { vramQ4: 7, vramQ8: 13, ramMin: 16 },
  "Mixtral 8x7B": { vramQ4: 25, vramQ8: 48, ramMin: 32 },
  "Qwen 2.5 7B": { vramQ4: 4.5, vramQ8: 8, ramMin: 8 },
  "Qwen 2.5 14B": { vramQ4: 8.5, vramQ8: 16, ramMin: 16 },
  "Qwen 2.5 32B": { vramQ4: 19, vramQ8: 35, ramMin: 32 },
  "Qwen 2.5 72B": { vramQ4: 42, vramQ8: 78, ramMin: 48 },
  "Qwen 2.5 Coder 7B": { vramQ4: 4.5, vramQ8: 8, ramMin: 8 },
  "Qwen 2.5 Coder 14B": { vramQ4: 8.5, vramQ8: 16, ramMin: 16 },
  "DeepSeek-Coder-V2-Lite 16B": { vramQ4: 9, vramQ8: 17, ramMin: 16 },
  "DeepSeek-V2-Lite 16B": { vramQ4: 9, vramQ8: 17, ramMin: 16 },
  "DeepSeek-R1-Distill-Qwen-7B": { vramQ4: 4.5, vramQ8: 8, ramMin: 8 },
  "DeepSeek-R1-Distill-Qwen-14B": { vramQ4: 8.5, vramQ8: 16, ramMin: 16 },
  "CodeLlama 7B": { vramQ4: 4.5, vramQ8: 8, ramMin: 8 },
  "CodeLlama 13B": { vramQ4: 7.5, vramQ8: 14, ramMin: 16 },
  "CodeLlama 34B": { vramQ4: 19, vramQ8: 36, ramMin: 32 },
  "Phi-3 Mini 3.8B": { vramQ4: 2.5, vramQ8: 4.5, ramMin: 4 },
  "Phi-3 Medium 14B": { vramQ4: 8.5, vramQ8: 16, ramMin: 16 },
  "Gemma 2 2B": { vramQ4: 1.5, vramQ8: 3, ramMin: 4 },
  "Gemma 2 9B": { vramQ4: 5.5, vramQ8: 10, ramMin: 8 },
  "Gemma 2 27B": { vramQ4: 16, vramQ8: 30, ramMin: 32 },
  "Falcon 7B": { vramQ4: 4.5, vramQ8: 8, ramMin: 8 },
  "Falcon 40B": { vramQ4: 23, vramQ8: 43, ramMin: 48 },
  "StableLM 2 1.6B": { vramQ4: 1.2, vramQ8: 2.2, ramMin: 4 },
  "StableLM 2 12B": { vramQ4: 7, vramQ8: 13, ramMin: 16 },
  "Yi 6B": { vramQ4: 4, vramQ8: 7.5, ramMin: 8 },
  "Yi 34B": { vramQ4: 19, vramQ8: 36, ramMin: 32 },
  "Solar 10.7B": { vramQ4: 6.5, vramQ8: 12, ramMin: 16 },
};

export function getVramForModel(slug: string): VramInfo | null {
  for (const [name, info] of Object.entries(vramMap)) {
    if (slug.includes(name.toLowerCase().replace(/\s+/g, "-")) || slug.includes(name.toLowerCase().replace(/\s+/g, ""))) {
      return info;
    }
  }
  return null;
}

export function getVramForExactName(name: string): VramInfo | null {
  return vramMap[name] ?? null;
}

export const knownModelNames = Object.keys(vramMap);
