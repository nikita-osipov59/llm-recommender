import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ModelPage({ params }: Props) {
  const { slug } = await params;
  const model = await prisma.model.findUnique({ where: { slug } });

  if (!model) notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
        ← Назад к поиску
      </Link>

      <div className="mt-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{model.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {model.provider} • {model.parameters}B параметров
          </p>
        </div>

        {model.description && (
          <p className="text-gray-700 dark:text-gray-300">{model.description}</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InfoBox label="VRAM (Q4)" value={model.vramQ4 ? `${model.vramQ4} ГБ` : "—"} />
          <InfoBox label="VRAM (Q8)" value={model.vramQ8 ? `${model.vramQ8} ГБ` : "—"} />
          <InfoBox label="RAM мин." value={model.ramMin ? `${model.ramMin} ГБ` : "—"} />
          <InfoBox label="Загрузки" value={`${(model.downloads / 1000).toFixed(0)}K`} />
        </div>

        {model.hfUrl && (
          <a
            href={model.hfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-blue-600 dark:text-blue-400 hover:underline"
          >
            Открыть на HuggingFace →
          </a>
        )}
      </div>
    </main>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
