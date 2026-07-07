"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ModelCard from "./ModelCard";

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
}

export default function ResultsList({ models, loading, error }: Props) {
  const router = useRouter();
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());

  const handleToggle = (slug: string) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-gray-500">Ищем подходящие модели...</p>
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
          Найдено моделей: {models.length}
        </p>
        {selectedSlugs.size >= 2 && (
          <button
            onClick={() =>
              router.push("/compare?slugs=" + [...selectedSlugs].join(","))
            }
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 px-3 rounded-lg transition"
          >
            Сравнить ({selectedSlugs.size})
          </button>
        )}
      </div>

      {models.map((model) => (
        <ModelCard
          key={model.slug}
          model={model}
          selected={selectedSlugs.has(model.slug)}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
}
