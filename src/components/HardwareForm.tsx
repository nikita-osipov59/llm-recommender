"use client";

import { useState, FormEvent, useEffect } from "react";

interface GpuEntry {
  name: string;
  vramGb: number;
  vendor: string;
}

interface HardwareSpec {
  gpu: string;
  vram: number;
  ram: number;
  cpu: string;
}

interface FormValues {
  gpu: string;
  vram: string;
  ram: string;
  cpu: string;
}

interface Props {
  onRecommend: (spec: HardwareSpec) => void;
  loading: boolean;
  initialValues?: FormValues;
  onFormChange?: (values: FormValues) => void;
}

export default function HardwareForm({ onRecommend, loading, initialValues, onFormChange }: Props) {
  const [gpus, setGpus] = useState<GpuEntry[]>([]);
  const [gpusLoading, setGpusLoading] = useState(true);
  const [gpu, setGpu] = useState("");
  const [vram, setVram] = useState("");
  const [ram, setRam] = useState("");
  const [cpu, setCpu] = useState("");

  useEffect(() => {
    if (initialValues) {
      setGpu(initialValues.gpu);
      setVram(initialValues.vram);
      setRam(initialValues.ram);
      setCpu(initialValues.cpu);
    }
  }, []);

  useEffect(() => {
    fetch("/api/gpus")
      .then((r) => r.json())
      .then((data) => {
        if (data.gpus) setGpus(data.gpus);
      })
      .catch(() => {})
      .finally(() => setGpusLoading(false));
  }, []);

  useEffect(() => {
    onFormChange?.({ gpu, vram: vram || "", ram: ram || "", cpu });
  }, [gpu, vram, ram, cpu, onFormChange]);

  const handleGpuChange = (value: string) => {
    setGpu(value);
    const gpuData = gpus.find((g) => `${g.vendor} ${g.name}` === value);
    if (gpuData) {
      setVram(String(gpuData.vramGb));
    } else {
      const match = value.match(/(\d+)\s*GB/);
      if (match) setVram(match[1]);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onRecommend({
      gpu,
      vram: Number(vram) || 0,
      ram: Number(ram) || 0,
      cpu,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Видеокарта (GPU)</label>
        <select
          value={gpu}
          onChange={(e) => handleGpuChange(e.target.value)}
          className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700"
          disabled={gpusLoading}
        >
          <option value="">
            {gpusLoading ? "Загрузка..." : "— выберите GPU —"}
          </option>
          {gpus.map((g) => {
            const label = `${g.vendor} ${g.name} (${g.vramGb}GB)`;
            return (
              <option key={label} value={label}>
                {label}
              </option>
            );
          })}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          VRAM (ГБ)  <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={vram}
          onChange={(e) => setVram(e.target.value)}
          placeholder="Например: 16"
          className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700"
          required
          min="1"
          step="0.1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          RAM (ГБ)  <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={ram}
          onChange={(e) => setRam(e.target.value)}
          placeholder="Например: 32"
          className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700"
          required
          min="1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Процессор (CPU) — необязательно</label>
        <input
          type="text"
          value={cpu}
          onChange={(e) => setCpu(e.target.value)}
          placeholder="Например: Ryzen 7 9800X3D"
          className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
      >
        {loading ? "Поиск..." : "Подобрать модель"}
      </button>
    </form>
  );
}
