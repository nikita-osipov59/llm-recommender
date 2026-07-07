export default function SkeletonCard() {
  return (
    <div className="border rounded-lg p-4 dark:border-gray-700 animate-pulse">
      <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
    </div>
  );
}
