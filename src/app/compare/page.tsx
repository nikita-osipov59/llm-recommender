import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ComparisonTable from "@/components/ComparisonTable";
import { ArrowLeft } from "lucide-react";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ slugs?: string }>;
}) {
  const params = await searchParams;
  const slugList = params.slugs ? params.slugs.split(",").filter(Boolean) : [];

  let models: Array<{
    slug: string; name: string; provider: string; parameters: number;
    vramQ4: number | null; vramQ8: number | null; ramMin: number | null;
    hfUrl: string | null; downloads: number; description: string | null;
  }> | null = null;

  if (slugList.length >= 2) {
    models = await prisma.model.findMany({
      where: { slug: { in: slugList } },
    });
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
        <ArrowLeft size={14} className="inline mr-1" /> Назад к поиску
      </Link>

      {slugList.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Выберите модели для сравнения</p>
        </div>
      )}

      {slugList.length === 1 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Выберите хотя бы 2 модели</p>
        </div>
      )}

      {models && models.length < 2 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Модели не найдены</p>
        </div>
      )}

      {models && models.length >= 2 && (
        <div className="mt-4">
          <ComparisonTable models={models} />
        </div>
      )}
    </main>
  );
}
