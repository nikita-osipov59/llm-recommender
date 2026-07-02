"use client";

import { useState } from "react";
import HardwareForm from "@/components/HardwareForm";
import ResultsList from "@/components/ResultsList";

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

interface HardwareSpec {
  gpu: string;
  vram: number;
  ram: number;
  cpu: string;
}

export default function Home() {
  const [models, setModels] = useState<ModelData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [hasSearched, setHasSearched] = useState(false);

  const handleRecommend = async (spec: HardwareSpec) => {
    setLoading(true);
    setError(undefined);
    setHasSearched(true);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(spec),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ошибка сервера");
      }

      const data = await res.json();
      setModels(data.models);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">LLM Recommender</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Подберите локальную модель под ваше железо
        </p>
      </header>

      <section className="mb-8">
        <HardwareForm onRecommend={handleRecommend} loading={loading} />
      </section>

      <section>
        {hasSearched && (
          <ResultsList models={models} loading={loading} error={error} />
        )}
      </section>
    </main>
  );
}
