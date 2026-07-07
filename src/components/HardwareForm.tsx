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
  formValues: FormValues;
  onFormChange: (values: FormValues) => void;
}

export default function HardwareForm({ onRecommend, loading, formValues, onFormChange }: Props) {
  const [gpus, setGpus] = useState<GpuEntry[]>([]);
  const [gpusLoading, setGpusLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gpus")
      .then((r) => r.json())
      .then((data) => {
        if (data.gpus) setGpus(data.gpus);
      })
      .catch(() => {})
      .finally(() => setGpusLoading(false));
  }, []);

  const handleGpuChange = (value: string) => {
    const gpuData = gpus.find((g) => `${g.vendor} ${g.name}` === value);
    if (gpuData) {
      onFormChange({ ...formValues, gpu: value, vram: String(gpuData.vramGb) });
    } else {
      const match = value.match(/(\d+)\s*GB/);
      if (match) onFormChange({ ...formValues, gpu: value, vram: match[1] });
      else onFormChange({ ...formValues, gpu: value });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onRecommend({
      gpu: formValues.gpu,
      vram: Number(formValues.vram) || 0,
      ram: Number(formValues.ram) || 0,
      cpu: formValues.cpu,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Видеокарта (GPU)</label>
        <select
          value={formValues.gpu}
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
          value={formValues.vram}
          onChange={(e) => onFormChange({ ...formValues, vram: e.target.value })}
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
          value={formValues.ram}
          onChange={(e) => onFormChange({ ...formValues, ram: e.target.value })}
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
          value={formValues.cpu}
          onChange={(e) => onFormChange({ ...formValues, cpu: e.target.value })}
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
