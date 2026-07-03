export interface HFModelResult {
  slug: string;
  name: string;
  provider: string;
  parameters: number;
  downloads: number;
  hfUrl: string;
  description: string;
}

const HF_API = "https://huggingface.co/api/models";

// Curated list of popular open-source LLMs with known parameter counts.
// Downloads are fetched live from HF API to keep them current.
const CURATED_MODELS: Array<{ id: string; name: string; provider: string; parameters: number }> = [
  { id: "meta-llama/Llama-3.2-1B", name: "Llama 3.2 1B", provider: "Meta", parameters: 1 },
  { id: "meta-llama/Llama-3.2-3B", name: "Llama 3.2 3B", provider: "Meta", parameters: 3 },
  { id: "meta-llama/Llama-3.1-8B", name: "Llama 3.1 8B", provider: "Meta", parameters: 8 },
  { id: "meta-llama/Llama-3.1-70B", name: "Llama 3.1 70B", provider: "Meta", parameters: 70 },
  { id: "mistralai/Mistral-7B-v0.3", name: "Mistral 7B", provider: "Mistral", parameters: 7 },
  { id: "mistralai/Mistral-Nemo-Instruct-2407", name: "Mistral Nemo 12B", provider: "Mistral", parameters: 12 },
  { id: "mistralai/Mixtral-8x7B-v0.1", name: "Mixtral 8x7B", provider: "Mistral", parameters: 47 },
  { id: "Qwen/Qwen2.5-7B-Instruct", name: "Qwen 2.5 7B", provider: "Qwen", parameters: 7 },
  { id: "Qwen/Qwen2.5-14B-Instruct", name: "Qwen 2.5 14B", provider: "Qwen", parameters: 14 },
  { id: "Qwen/Qwen2.5-32B-Instruct", name: "Qwen 2.5 32B", provider: "Qwen", parameters: 32 },
  { id: "Qwen/Qwen2.5-72B-Instruct", name: "Qwen 2.5 72B", provider: "Qwen", parameters: 72 },
  { id: "Qwen/Qwen2.5-Coder-7B-Instruct", name: "Qwen 2.5 Coder 7B", provider: "Qwen", parameters: 7 },
  { id: "Qwen/Qwen2.5-Coder-14B-Instruct", name: "Qwen 2.5 Coder 14B", provider: "Qwen", parameters: 14 },
  { id: "deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct", name: "DeepSeek-Coder-V2-Lite 16B", provider: "DeepSeek", parameters: 16 },
  { id: "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B", name: "DeepSeek-R1-Distill-Qwen-7B", provider: "DeepSeek", parameters: 7 },
  { id: "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B", name: "DeepSeek-R1-Distill-Qwen-14B", provider: "DeepSeek", parameters: 14 },
  { id: "codellama/CodeLlama-7b-hf", name: "CodeLlama 7B", provider: "Meta", parameters: 7 },
  { id: "codellama/CodeLlama-13b-hf", name: "CodeLlama 13B", provider: "Meta", parameters: 13 },
  { id: "codellama/CodeLlama-34b-hf", name: "CodeLlama 34B", provider: "Meta", parameters: 34 },
  { id: "microsoft/Phi-3-mini-4k-instruct", name: "Phi-3 Mini 3.8B", provider: "Microsoft", parameters: 4 },
  { id: "microsoft/Phi-3-medium-4k-instruct", name: "Phi-3 Medium 14B", provider: "Microsoft", parameters: 14 },
  { id: "google/gemma-2-2b-it", name: "Gemma 2 2B", provider: "Google", parameters: 2 },
  { id: "google/gemma-2-9b-it", name: "Gemma 2 9B", provider: "Google", parameters: 9 },
  { id: "google/gemma-2-27b-it", name: "Gemma 2 27B", provider: "Google", parameters: 27 },
  { id: "tiiuae/falcon-7b", name: "Falcon 7B", provider: "TII", parameters: 7 },
  { id: "tiiuae/falcon-40b", name: "Falcon 40B", provider: "TII", parameters: 40 },
  { id: "01-ai/Yi-6B", name: "Yi 6B", provider: "01-AI", parameters: 6 },
  { id: "01-ai/Yi-34B", name: "Yi 34B", provider: "01-AI", parameters: 34 },
  { id: "upstage/SOLAR-10.7B-v1.0", name: "Solar 10.7B", provider: "Upstage", parameters: 10.7 },
  { id: "stabilityai/stablelm-2-1_6b", name: "StableLM 2 1.6B", provider: "Stability AI", parameters: 1.6 },
  { id: "stabilityai/stablelm-2-12b", name: "StableLM 2 12B", provider: "Stability AI", parameters: 12 },
];

function slugify(id: string): string {
  return id.replace(/\//g, "--");
}

export async function getModelsFromHF(): Promise<HFModelResult[]> {
  // Fetch download counts for all curated models in parallel
  const results = await Promise.allSettled(
    CURATED_MODELS.map((m) =>
      fetch(`${HF_API}/${m.id}`, {
        headers: { "User-Agent": "llm-recommender/1.0" },
        signal: AbortSignal.timeout(10000),
      })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${r.status}`))))
        .then((data: any) => ({
          slug: slugify(m.id),
          name: m.name,
          provider: m.provider,
          parameters: m.parameters,
          downloads: data.downloads || 0,
          hfUrl: `https://huggingface.co/${m.id}`,
          description: data.cardData?.description || "",
        }))
    )
  );

  const models: HFModelResult[] = [];

  for (const r of results) {
    if (r.status === "fulfilled") {
      models.push(r.value);
    }
  }

  return models.sort((a, b) => b.downloads - a.downloads);
}
