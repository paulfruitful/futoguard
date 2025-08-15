import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MobileHeader } from "@/components/mobile-header";

interface FeedDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function FeedDetailsPage({
  params,
}: FeedDetailsPageProps) {
  const { id } = await params;

  // Mock data - in a real app, this would be fetched based on the ID
  const feedDetails = {
    id,
    user: {
      name: "Chuakwubuka Kennedy",
      role: "Cyber Security",
      year: "2019",
      avatar: "/placeholder.svg?height=80&width=80",
    },
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    emergencyLog: {
      location: "Esioboro",
      type: "Resolved",
      time: "7:15 am",
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="Details" showBack />

      <div className="p-4 space-y-6 py-20">
        {/* User Profile Section */}
        <div className="text-center">
          <Avatar className="w-20 h-20 mx-auto mb-4">
            <AvatarImage src={feedDetails.user.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-gray-200">
              {feedDetails.user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-semibold mb-1">
            {feedDetails.user.name}
          </h2>
          <p className="text-sm text-gray-600">{feedDetails.user.role}</p>
          <p className="text-sm text-gray-600">{feedDetails.user.year}</p>
        </div>

        {/* Description Section */}
        <div>
          <h3 className="font-semibold mb-3">Description:</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {feedDetails.description}
          </p>
        </div>

        {/* Emergency Log Section */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Emergency Log:</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Location:</span>
                <span className="text-sm text-gray-600">
                  {feedDetails.emergencyLog.location}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Type:</span>
                <span className="text-sm text-green-600 font-medium">
                  {feedDetails.emergencyLog.type}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Time:</span>
                <span className="text-sm text-gray-600">
                  {feedDetails.emergencyLog.time}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Blockchain TransactionId :
                </span>
                <span className="text-sm text-gray-600">lsk$hdjbnv..</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
