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
  tags?: string | null;
}

interface ModelCardProps {
  model: ModelData;
  selected: boolean;
  onToggle: (slug: string) => void;
  userVram: number;
  isBest: boolean;
  favorited: boolean;
  onFavorite: (slug: string) => void;
}

export default function ModelCard({ model, selected, onToggle, userVram, isBest, favorited, onFavorite }: ModelCardProps) {
  function vramBar(vram: number) {
    if (!userVram || userVram <= 0) return null;
    const pct = Math.min((vram / userVram) * 100, 100);
    const color = pct > 90 ? "#ef4444" : pct > 70 ? "#f59e0b" : "#22c55e";
    return (
      <div className="mt-2">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
        <p className="text-xs text-gray-400 mt-1">{vram} / {userVram} ГБ VRAM</p>
      </div>
    );
  }

  const tags = model.tags ? model.tags.split(",") : [];

  return (
    <div className={`border rounded-lg p-4 dark:border-gray-700 dark:bg-gray-800 hover:shadow-md transition ${isBest ? "ring-2 ring-green-500" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link href={"/models/" + model.slug} className="hover:underline min-w-0">
              <h3 className="font-semibold text-lg truncate">{model.name}</h3>
            </Link>
            {isBest && (
              <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                Лучшая
              </span>
            )}
            <button
              onClick={() => onFavorite(model.slug)}
              className="text-lg leading-none cursor-pointer shrink-0 hover:scale-110 transition"
              title={favorited ? "Убрать из избранного" : "Добавить в избранное"}
            >
              {favorited ? "★" : "☆"}
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {model.provider} • {model.parameters}B параметров
          </p>
        </div>
        <button
          onClick={() => onToggle(model.slug)}
          className={`text-sm font-medium py-1 px-3 rounded-lg border transition whitespace-nowrap cursor-pointer shrink-0 ${
            selected
              ? "bg-blue-600 text-white border-blue-600"
              : "border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
          }`}
        >
          {selected ? "В сравнении ✓" : "Сравнить"}
        </button>
      </div>

      {tags.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        {model.vramQ4 && (
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded p-2">
            <span className="text-gray-500 dark:text-gray-400">VRAM (Q4)</span>
            <p className="font-medium">{model.vramQ4} ГБ</p>
            {vramBar(model.vramQ4)}
          </div>
        )}
        {model.vramQ8 && (
          <div className="bg-purple-50 dark:bg-purple-900/30 rounded p-2">
            <span className="text-gray-500 dark:text-gray-400">VRAM (Q8)</span>
            <p className="font-medium">{model.vramQ8} ГБ</p>
            {model.vramQ4 ? null : vramBar(model.vramQ8)}
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
