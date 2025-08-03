import { UserCardSkeleton } from "./user-card-skeleton";

export function UsersPageSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {/* Search Bar Skeleton */}
      <div className="relative">
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>

      {/* Tab Navigation Skeleton */}
      <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex-1 h-10 bg-gray-300 rounded animate-pulse"
          ></div>
        ))}
      </div>

      {/* Users List Skeleton */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <UserCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
