export interface HFModelResult {
  slug: string;
  name: string;
  provider: string;
  parameters: number;
  downloads: number;
  hfUrl: string;
  description: string;
  tags: string;
}

function inferTags(id: string): string[] {
  const n = id.toLowerCase();
  const tags: string[] = [];
  if (/\b(instruct|chat)\b/.test(n)) tags.push("instruct");
  if (/\bcode\b/.test(n)) tags.push("code");
  if (/\bvision\b/.test(n)) tags.push("vision");
  if (/\breasoning\b/.test(n)) tags.push("reasoning");
  if (/\bmath\b/.test(n)) tags.push("math");
  if (tags.length === 0) tags.push("base");
  return tags;
}

const HF_API = "https://huggingface.co/api/models";
const KNOWN_ORGS = ["meta-llama", "mistralai", "Qwen", "deepseek-ai", "codellama", "microsoft", "google", "tiiuae", "01-ai", "upstage", "stabilityai", "nvidia", "cognitivecomputations"];

function parseParametersFromId(id: string): number {
  const match = id.match(/(\d+)[bB]/);
  if (match) return parseFloat(match[1]);
  if (id.includes("1.6")) return 1.6;
  if (id.includes("10.7") || id.includes("10_7")) return 10.7;
  if (id.includes("3.8") || id.includes("3_8")) return 3.8;
  return 0;
}

function slugify(id: string): string {
  return id.replace(/\//g, "--");
}

export async function getModelsFromHF(): Promise<HFModelResult[]> {
  const results = await Promise.allSettled(
    KNOWN_ORGS.map((org) =>
      fetch(`${HF_API}?author=${org}&sort=downloads&direction=-1&limit=10`, {
        headers: { "User-Agent": "llm-recommender/1.0" },
        signal: AbortSignal.timeout(15000),
      })
        .then((r) => (r.ok ? r.json() : []))
    )
  );

  const models: HFModelResult[] = [];
  const seen = new Set<string>();

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    const list: any[] = result.value;
    if (!Array.isArray(list)) continue;

    for (const model of list) {
      if (!model.id) continue;

      const paramsFromName = parseParametersFromId(model.id);
      if (paramsFromName === 0) continue;

      const slug = slugify(model.id);
      if (seen.has(slug)) continue;
      seen.add(slug);

      const name = model.id.split("/").pop() || model.id;
      const provider = model.id.split("/")[0] || "unknown";

      models.push({
        slug,
        name,
        provider,
        parameters: paramsFromName,
        downloads: model.downloads || 0,
        hfUrl: `https://huggingface.co/${model.id}`,
        description: model.cardData?.description || "",
        tags: inferTags(model.id).join(","),
      });
    }
  }

  return models.sort((a, b) => b.downloads - a.downloads);
}
