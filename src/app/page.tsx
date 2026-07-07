"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

interface SessionState {
  models: ModelData[];
  selectedSlugs: string[];
  hasSearched: boolean;
  formGpu: string;
  formVram: string;
  formRam: string;
  formCpu: string;
}

const STORAGE_KEY = "llm-recommender-search";

export default function Home() {
  const [models, setModels] = useState<ModelData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const [formGpu, setFormGpu] = useState("");
  const [formVram, setFormVram] = useState("");
  const [formRam, setFormRam] = useState("");
  const [formCpu, setFormCpu] = useState("");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: SessionState = JSON.parse(raw);
        setModels(saved.models);
        setSelectedSlugs(new Set(saved.selectedSlugs));
        setHasSearched(saved.hasSearched);
        if (saved.formGpu) setFormGpu(saved.formGpu);
        if (saved.formVram) setFormVram(saved.formVram);
        if (saved.formRam) setFormRam(saved.formRam);
        if (saved.formCpu) setFormCpu(saved.formCpu);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const state: SessionState = {
      models,
      selectedSlugs: [...selectedSlugs],
      hasSearched,
      formGpu,
      formVram,
      formRam,
      formCpu,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [models, selectedSlugs, hasSearched, formGpu, formVram, formRam, formCpu]);

  const handleToggle = useCallback((slug: string) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
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
      <header className="mb-8">
        <h1 className="text-3xl font-bold">LLM Recommender</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Подберите локальную модель под ваше железо
        </p>
      </header>

      <section className="mb-8">
        <HardwareForm
          onRecommend={handleRecommend}
          loading={loading}
          initialValues={{ gpu: formGpu, vram: formVram, ram: formRam, cpu: formCpu }}
          onFormChange={(v) => {
            setFormGpu(v.gpu);
            setFormVram(v.vram);
            setFormRam(v.ram);
            setFormCpu(v.cpu);
          }}
        />
      </section>

      <section>
        {hasSearched && (
          <ResultsList
            models={models}
            loading={loading}
            error={error}
            selectedSlugs={selectedSlugs}
            onToggle={handleToggle}
          />
        )}
      </section>
    </main>
  );
}
