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

export async function getModelsFromHF(): Promise<HFModelResult[]> {
  const url = `${HF_API}?search=llm+text-generation&sort=downloads&direction=-1&limit=100`;

  const res = await fetch(url, {
    headers: { "User-Agent": "llm-recommender/1.0" },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`HuggingFace API error: ${res.status}`);
  }

  const data = (await res.json()) as any[];

  return data
    .map((model) => {
      const cardData = model.cardData || {};
      const modelIndex = cardData["model-index"] || [];
      let parameters = 0;
      if (modelIndex[0]?.results?.[0]?.metrics?.parameters) {
        const raw = modelIndex[0].results[0].metrics.parameters;
        parameters = parseFloat(raw);
      }
      if (!parameters && model.pipeline_tag === "text-generation" && model.siblings) {
        const safetensors = model.siblings.filter((s: any) => s.rfilename.endsWith(".safetensors"));
        if (safetensors.length > 0) {
          const totalBytes = safetensors.reduce((sum: number, s: any) => sum + (s.size || 0), 0);
          parameters = Math.round((totalBytes / (2 * 1024 * 1024 * 1024)) * 10) / 10;
        }
      }

      const name = model.id.split("/").pop() || model.id;
      const provider = model.id.split("/")[0] || "unknown";
      const slug = model.id.replace(/\//g, "--");

      return {
        slug,
        name,
        provider,
        parameters: parameters || 0,
        downloads: model.downloads || 0,
        hfUrl: `https://huggingface.co/${model.id}`,
        description: cardData?.description || "",
      };
    })
    .filter((m) => m.parameters > 0);
}
