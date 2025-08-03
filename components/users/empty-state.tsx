import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Settings, Search, Users } from "lucide-react";

interface EmptyStateProps {
  type: "no-registered-location" | "no-search-results" | "no-users" | "error";
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

export function EmptyState({
  type,
  title,
  description,
  actionText,
  actionHref,
}: EmptyStateProps) {
  const getIcon = () => {
    switch (type) {
      case "no-registered-location":
        return <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />;
      case "no-search-results":
        return <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />;
      case "no-users":
        return <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />;
      case "error":
        return (
          <div className="w-12 h-12 text-gray-400 mx-auto mb-4 text-2xl">
            ⚠️
          </div>
        );
      default:
        return <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />;
    }
  };

  return (
    <div className="text-center py-8 px-4">
      {getIcon()}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {actionText && actionHref && (
        <Button asChild className="bg-red-500 hover:bg-red-600">
          <Link href={actionHref}>
            <Settings className="w-4 h-4 mr-2" />
            {actionText}
          </Link>
        </Button>
      )}
    </div>
  );
}
