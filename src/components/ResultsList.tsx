"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ModelCard from "./ModelCard";
import SkeletonCard from "./SkeletonCard";

interface ModelData {
  slug: string;
  name: string;
  provider: string;
  parameters: number;
  vramQ4: number | null;
  vramQ8: number | null;
  ramMin: number | null;
  hfUrl: string | null;
  downloads: number;
  description: string | null;
}

interface Props {
  models: ModelData[];
  loading: boolean;
  error?: string;
  selectedSlugs: Set<string>;
  onToggle: (slug: string) => void;
}

type QuantFilter = "all" | "q4" | "q8";
type SortKey = "parameters" | "vramQ4" | "downloads";

const QUANT_LABELS: Record<QuantFilter, string> = { all: "Все", q4: "Q4", q8: "Q8" };
const SORT_LABELS: Record<SortKey, string> = { parameters: "По параметрам", vramQ4: "По VRAM (Q4)", downloads: "По загрузкам" };

export default function ResultsList({ models, loading, error, selectedSlugs, onToggle }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [quantFilter, setQuantFilter] = useState<QuantFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("parameters");

  const filtered = useMemo(() => {
    let result = models.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase())
    );
    if (quantFilter === "q4") result = result.filter((m) => m.vramQ4 !== null);
    if (quantFilter === "q8") result = result.filter((m) => m.vramQ8 !== null);
    result.sort((a, b) => (b[sortKey] ?? 0) - (a[sortKey] ?? 0));
    return result;
  }, [models, search, quantFilter, sortKey]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>Ошибка: {error}</p>
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">Ничего не найдено</p>
        <p className="text-sm mt-1">Попробуйте увеличить VRAM или RAM</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Найдено моделей: {filtered.length}
        </p>
        <button
          onClick={() =>
            router.push("/compare?slugs=" + [...selectedSlugs].join(","))
          }
          className={`text-sm font-medium py-1.5 px-3 rounded-lg border transition whitespace-nowrap ${
            selectedSlugs.size >= 2
              ? "bg-blue-600 text-white border-blue-600 visible"
              : "border-transparent text-transparent invisible"
          } cursor-pointer`}
        >
          Сравнить ({selectedSlugs.size})
        </button>
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск по названию..."
        className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700 text-sm"
      />

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(Object.keys(QUANT_LABELS) as QuantFilter[]).map((key) => (
            <button
              key={key}
              onClick={() => setQuantFilter(key)}
              className={`text-sm px-3 py-1 rounded-md transition cursor-pointer ${
                quantFilter === key
                  ? "bg-white dark:bg-gray-600 shadow-sm font-medium"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {QUANT_LABELS[key]}
            </button>
          ))}
        </div>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="text-sm border rounded-lg p-1.5 dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
        >
          {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
            <option key={key} value={key}>{SORT_LABELS[key]}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 && (
        <p className="text-center py-8 text-gray-400 text-sm">Ничего не найдено</p>
      )}

      {filtered.map((model) => (
        <ModelCard
          key={model.slug}
          model={model}
          selected={selectedSlugs.has(model.slug)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
