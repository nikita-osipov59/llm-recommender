"use client";

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
  selectedSlugs: Set<string>;
  onToggle: (slug: string) => void;
}

export default function ResultsList({ models, loading, error, selectedSlugs, onToggle }: Props) {
  const router = useRouter();

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

      {models.map((model) => (
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
