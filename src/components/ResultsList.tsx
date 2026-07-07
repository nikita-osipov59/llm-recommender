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

export default function ResultsList({ models, loading, error, selectedSlugs, onToggle }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => models.filter((m) => m.name.toLowerCase().includes(search.toLowerCase())),
    [models, search]
  );

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
