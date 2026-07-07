import Link from "next/link";

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

interface ModelCardProps {
  model: ModelData;
  selected: boolean;
  onToggle: (slug: string) => void;
}

export default function ModelCard({ model, selected, onToggle }: ModelCardProps) {
  return (
    <div className="border rounded-lg p-4 dark:border-gray-700 dark:bg-gray-800 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href={"/models/" + model.slug} className="hover:underline">
            <h3 className="font-semibold text-lg">{model.name}</h3>
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {model.provider} • {model.parameters}B параметров
          </p>
        </div>
        <button
          onClick={() => onToggle(model.slug)}
          className={`text-sm font-medium py-1 px-3 rounded-lg border transition whitespace-nowrap cursor-pointer ${
            selected
              ? "bg-blue-600 text-white border-blue-600"
              : "border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
          }`}
        >
          {selected ? "В сравнении ✓" : "Сравнить"}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        {model.vramQ4 && (
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded p-2">
            <span className="text-gray-500 dark:text-gray-400">VRAM (Q4)</span>
            <p className="font-medium">{model.vramQ4} ГБ</p>
          </div>
        )}
        {model.vramQ8 && (
          <div className="bg-purple-50 dark:bg-purple-900/30 rounded p-2">
            <span className="text-gray-500 dark:text-gray-400">VRAM (Q8)</span>
            <p className="font-medium">{model.vramQ8} ГБ</p>
          </div>
        )}
        {model.ramMin && (
          <div className="bg-green-50 dark:bg-green-900/30 rounded p-2">
            <span className="text-gray-500 dark:text-gray-400">RAM мин.</span>
            <p className="font-medium">{model.ramMin} ГБ</p>
          </div>
        )}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2">
          <span className="text-gray-500 dark:text-gray-400">Загрузок</span>
          <p className="font-medium">{(model.downloads / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {model.description && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {model.description}
        </p>
      )}

      {model.hfUrl && (
        <a
          href={model.hfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Открыть на HuggingFace →
        </a>
      )}
    </div>
  );
}
