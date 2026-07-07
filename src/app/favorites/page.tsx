"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bookmark } from "lucide-react";
import ModelCard from "@/components/ModelCard";
import SkeletonCard from "@/components/SkeletonCard";

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
  tags?: string | null;
}

const FAV_KEY = "llm-recommender-favorites";
const CATEGORY_MAP: Record<string, string> = {
  Чат: "instruct",
  Код: "code",
  Зрение: "vision",
  Рассуждение: "reasoning",
};

function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

export default function FavoritesPage() {
  const [models, setModels] = useState<ModelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [favs, setFavs] = useState<Set<string>>(loadFavorites);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [quantFilter, setQuantFilter] = useState<"all" | "q4" | "q8">("all");
  const [sortKey, setSortKey] = useState<"parameters" | "vramQ4" | "downloads">("parameters");

  useEffect(() => {
    const slugs = [...favs];
    if (slugs.length === 0) {
      setModels([]);
      setLoading(false);
      return;
    }
    fetch(`/api/models?slugs=${slugs.join(",")}`)
      .then((r) => r.json())
      .then((data) => {
        setModels(data.models ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem(FAV_KEY, JSON.stringify([...favs]));
  }, [favs]);

  function handleFavorite(slug: string) {
    setFavs((prev) => {
      const next = new Set(prev);
      next.delete(slug);
      return next;
    });
    setModels((prev) => prev.filter((m) => m.slug !== slug));
  }

  const filtered = useMemo(() => {
    let result = models.filter((m) => {
      if (!m.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter) {
        const tag = CATEGORY_MAP[categoryFilter];
        if (!m.tags?.includes(tag)) return false;
      }
      return true;
    });
    if (quantFilter === "q4") result = result.filter((m) => m.vramQ4 !== null);
    if (quantFilter === "q8") result = result.filter((m) => m.vramQ8 !== null);
    result.sort((a, b) => (b[sortKey] ?? 0) - (a[sortKey] ?? 0));
    return result;
  }, [models, search, categoryFilter, quantFilter, sortKey]);

  const loadingContent = (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
    </div>
  );

  const emptyContent = (
    <div className="text-center py-12 text-gray-500">
      <Bookmark size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
      <p className="text-lg">Список избранного пуст</p>
      <p className="text-sm mt-1">Добавьте модели в избранное на главной странице</p>
      <Link
        href="/"
        className="inline-block mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        Перейти к поиску
      </Link>
    </div>
  );

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
        <ArrowLeft size={14} className="inline mr-1" /> Назад к поиску
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-2">Избранное</h1>
      <p className="text-sm text-gray-500 mb-4">
        {models.length} {models.length === 1 ? "модель" : models.length >= 2 && models.length <= 4 ? "модели" : "моделей"}
      </p>

      {loading && loadingContent}

      {!loading && models.length === 0 && emptyContent}

      {!loading && models.length > 0 && (
        <>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию..."
            className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700 text-sm mb-3"
          />

          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-4">
            <button
              onClick={() => setCategoryFilter(null)}
              className={`text-sm px-3 py-1 rounded-md transition cursor-pointer ${
                !categoryFilter
                  ? "bg-white dark:bg-gray-600 shadow-sm font-medium"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Все
            </button>
            {Object.keys(CATEGORY_MAP).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`text-sm px-3 py-1 rounded-md transition cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-white dark:bg-gray-600 shadow-sm font-medium"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap mb-4">
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {(["all", "q4", "q8"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setQuantFilter(key)}
                  className={`text-sm px-3 py-1 rounded-md transition cursor-pointer ${
                    quantFilter === key
                      ? "bg-white dark:bg-gray-600 shadow-sm font-medium"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {{ all: "Все", q4: "Q4", q8: "Q8" }[key]}
                </button>
              ))}
            </div>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
              className="text-sm border rounded-lg p-1.5 dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
            >
              <option value="parameters">По параметрам</option>
              <option value="vramQ4">По VRAM (Q4)</option>
              <option value="downloads">По загрузкам</option>
            </select>
          </div>

          {filtered.map((model) => (
            <ModelCard
              key={model.slug}
              model={model}
              selected={false}
              onToggle={() => {}}
              userVram={0}
              isBest={false}
              favorited={true}
              onFavorite={handleFavorite}
            />
          ))}

          {filtered.length === 0 && (
            <p className="text-center py-8 text-gray-400 text-sm">Ничего не найдено</p>
          )}
        </>
      )}
    </main>
  );
}
