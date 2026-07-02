import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LLM Recommender — подбор локальных моделей",
  description: "Введите характеристики вашего железа и получите список подходящих LLM для локального запуска",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}
