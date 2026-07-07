"use client";

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

interface ComparisonTableProps {
  models: ModelData[];
  onClose?: () => void;
}

export default function ComparisonTable({ models, onClose }: ComparisonTableProps) {
  if (models.length < 2) return null;

  return (
    <div className="mt-6 border rounded-lg dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
        <h3 className="font-semibold">Сравнение моделей</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
          >
            Закрыть
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400 w-36">
                Характеристика
              </th>
              {models.map((m) => (
                <th key={m.slug} className="text-left px-4 py-2 font-semibold min-w-[150px]">
                  {m.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Row label="Провайдер" values={models.map((m) => m.provider)} />
            <Row label="Параметры" values={models.map((m) => `${m.parameters}B`)} />
            <Row label="VRAM (Q4)" values={models.map((m) => m.vramQ4 ? `${m.vramQ4} ГБ` : "—")} />
            <Row label="VRAM (Q8)" values={models.map((m) => m.vramQ8 ? `${m.vramQ8} ГБ` : "—")} />
            <Row label="RAM мин." values={models.map((m) => m.ramMin ? `${m.ramMin} ГБ` : "—")} />
            <Row label="Загрузки" values={models.map((m) => `${(m.downloads / 1000).toFixed(0)}K`)} />
            <Row label="HuggingFace" values={models.map((m) => m.hfUrl ? "Открыть" : "—")} isLink urls={models.map((m) => m.hfUrl)} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ label, values, isLink, urls }: {
  label: string;
  values: string[];
  isLink?: boolean;
  urls?: (string | null)[];
}) {
  return (
    <tr className="border-b dark:border-gray-700 even:bg-gray-50 dark:even:bg-gray-800/50">
      <td className="px-4 py-2 text-gray-500 dark:text-gray-400 font-medium">{label}</td>
      {values.map((val, i) => (
        <td key={i} className="px-4 py-2">
          {isLink && urls?.[i] ? (
            <a href={urls[i]!} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
              {val}
            </a>
          ) : (
            val
          )}
        </td>
      ))}
    </tr>
  );
}
