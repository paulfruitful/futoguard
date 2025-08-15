import { Card, CardContent } from "@/components/ui/card";
import { MobileHeader } from "@/components/mobile-header";
import { SideNav } from "@/components/SidebarNav";
import Link from "next/link";

const incidents = [
  {
    id: 1,
    title: "Incident Alert",
    location: "Robbery case at Esioboro",
    time: "5 min ago",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed facilisis ac nibh et consectetur. Mauris dolor est tellus lobortis posuere. Nullam a posuere rutrum lobortis posuere. Vestibulum posuere tellus. Vestibulum...",
  },
  {
    id: 2,
    title: "Incident Alert",
    location: "Robbery case at Esioboro",
    time: "11:09 pm",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed facilibus ac nibh et consectetur. Mauris dolor est tellus lobortis posuere. Nullam a posuere rutrum lobortis posuere. Vestibulum posuere tellus. Vestibulum...",
  },
  {
    id: 3,
    title: "Incident Alert",
    location: "Robbery case at Esioboro",
    time: "7:30 pm",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed facilibus ac nibh et consectetur. Mauris dolor est tellus lobortis posuere. Nullam a posuere rutrum lobortis posuere. Vestibulum posuere tellus. Vestibulum...",
  },
];

export default function FeedsPage() {
  return (
    <div className="min-h-screen bg-gray-50 ">
      <MobileHeader title="Incident Feed" />
      <SideNav />

      <div className="p-4 space-y-4 py-20">
        {incidents.map((incident) => (
          <Link
            href={`/feeds/${incident.id}`}
            key={incident.id}
            className="block"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-red-500">
                    {incident.title}
                  </h3>
                  <span className="text-xs text-gray-500">{incident.time}</span>
                </div>
                <p className="font-medium mb-2">{incident.location}</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {incident.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 lg:hidden">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">⚠️</span>
          </div>
        </div>
      </div>
    </div>
  );
}
