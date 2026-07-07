"use client";

import { useState, useEffect, useCallback } from "react";
import HardwareForm from "@/components/HardwareForm";
import ResultsList from "@/components/ResultsList";
import ScrollToTop from "@/components/ScrollToTop";
import ThemeToggle from "@/components/ThemeToggle";

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
}

interface SessionState {
  models: ModelData[];
  selectedSlugs: string[];
  hasSearched: boolean;
  formGpu: string;
  formVram: string;
  formRam: string;
  formVendor: string;
}

const STORAGE_KEY = "llm-recommender-search";

function loadSession(): SessionState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export default function Home() {
  const initial = loadSession();

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  const [models, setModels] = useState<ModelData[]>(initial?.models ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [hasSearched, setHasSearched] = useState(initial?.hasSearched ?? false);
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set(initial?.selectedSlugs));
  const [formGpu, setFormGpu] = useState(initial?.formGpu ?? "");
  const [formVram, setFormVram] = useState(initial?.formVram ?? "");
  const [formRam, setFormRam] = useState(initial?.formRam ?? "");
  const [formVendor, setFormVendor] = useState(initial?.formVendor ?? "");

  useEffect(() => {
    const state: SessionState = {
      models,
      selectedSlugs: [...selectedSlugs],
      hasSearched,
      formGpu,
      formVram,
      formRam,
      formVendor,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [models, selectedSlugs, hasSearched, formGpu, formVram, formRam, formVendor]);

  const handleToggle = useCallback((slug: string) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }, []);

  const handleFormChange = useCallback((v: { gpu: string; vram: string; ram: string; vendor: string }) => {
    setFormGpu(v.gpu);
    setFormVram(v.vram);
    setFormRam(v.ram);
    setFormVendor(v.vendor);
  }, []);

  const handleRecommend = async (spec: HardwareSpec) => {
    setLoading(true);
    setError(undefined);
    setHasSearched(true);
    setSelectedSlugs(new Set());

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
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">LLM Recommender</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Подберите локальную модель под ваше железо
          </p>
        </div>
        <ThemeToggle />
      </header>

      <section className="mb-8">
        <HardwareForm
          onRecommend={handleRecommend}
          loading={loading}
          formValues={{ gpu: formGpu, vram: formVram, ram: formRam, vendor: formVendor }}
          onFormChange={handleFormChange}
        />
      </section>

      <section>
        {hydrated && hasSearched && (
          <ResultsList
            models={models}
            loading={loading}
            error={error}
            selectedSlugs={selectedSlugs}
            onToggle={handleToggle}
          />
        )}
      </section>
      <ScrollToTop />
    </main>
  );
}
