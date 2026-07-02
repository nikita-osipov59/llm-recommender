"use client";

import { useState, FormEvent } from "react";

interface HardwareSpec {
  gpu: string;
  vram: number;
  ram: number;
  cpu: string;
}

interface Props {
  onRecommend: (spec: HardwareSpec) => void;
  loading: boolean;
}

const GPU_OPTIONS = [
  "NVIDIA GTX 1060 6GB",
  "NVIDIA RTX 3060 12GB",
  "NVIDIA RTX 3070 8GB",
  "NVIDIA RTX 3080 10GB",
  "NVIDIA RTX 3080 Ti 12GB",
  "NVIDIA RTX 3090 24GB",
  "NVIDIA RTX 4060 8GB",
  "NVIDIA RTX 4070 12GB",
  "NVIDIA RTX 4080 16GB",
  "NVIDIA RTX 4090 24GB",
  "NVIDIA RTX 5070 12GB",
  "NVIDIA RTX 5080 16GB",
  "NVIDIA RTX 5090 32GB",
  "AMD RX 6700 XT 12GB",
  "AMD RX 6800 16GB",
  "AMD RX 6900 XT 16GB",
  "AMD RX 7600 8GB",
  "AMD RX 7700 XT 12GB",
  "AMD RX 7800 XT 16GB",
  "AMD RX 7900 GRE 16GB",
  "AMD RX 7900 XT 20GB",
  "AMD RX 7900 XTX 24GB",
  "AMD RX 9070 16GB",
  "AMD RX 9070 XT 16GB",
  "Apple M1 (7 GPU)",
  "Apple M1 (8 GPU)",
  "Apple M1 Pro (14 GPU)",
  "Apple M1 Max (32 GPU)",
  "Apple M2 (8 GPU)",
  "Apple M2 Pro (19 GPU)",
  "Apple M2 Max (38 GPU)",
  "Apple M3 (10 GPU)",
  "Apple M3 Pro (18 GPU)",
  "Apple M3 Max (40 GPU)",
  "Apple M4 (10 GPU)",
  "Apple M4 Pro (20 GPU)",
  "Apple M4 Max (40 GPU)",
];

export default function HardwareForm({ onRecommend, loading }: Props) {
  const [gpu, setGpu] = useState("");
  const [vram, setVram] = useState("");
  const [ram, setRam] = useState("");
  const [cpu, setCpu] = useState("");

  const handleGpuChange = (value: string) => {
    setGpu(value);
    const match = value.match(/(\d+)\s*GB/);
    if (match) {
      setVram(match[1]);
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
        >
          <option value="">— выберите GPU —</option>
          {GPU_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
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
