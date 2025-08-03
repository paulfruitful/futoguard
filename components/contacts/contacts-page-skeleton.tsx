export function ContactsPageSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {/* Empty state skeleton */}
      <div className="text-center py-12 animate-pulse">
        <div className="w-48 h-48 bg-gray-200 rounded mx-auto mb-6"></div>
        <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-64 mx-auto mb-6"></div>
      </div>

      {/* Add button skeleton */}
      <div className="space-y-2">
        <div className="h-12 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
      </div>
    </div>
  );
}
