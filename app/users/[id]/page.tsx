import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, GraduationCap, Building } from "lucide-react";
import { MobileHeader } from "@/components/mobile-header";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

// Mock user data - in a real app, this would be fetched from a database
const getUserById = (id: string) => {
  const users = [
    {
      id: 1,
      name: "Uche Montana",
      department: "Computer Engineering",
      year: "2019",
      faculty: "School of Engineering and Engineering Technology",
      phone: "08163048772",
      avatar: "/placeholder.svg?height=120&width=120",
    },
    {
      id: 2,
      name: "Chinaza Joy",
      department: "Chemical Engineering",
      year: "2020",
      faculty: "School of Engineering and Engineering Technology",
      phone: "08163048773",
      avatar: "/placeholder.svg?height=120&width=120",
    },
    {
      id: 3,
      name: "Brian Osuji",
      department: "Electrical Engineering",
      year: "2021",
      faculty: "School of Engineering and Engineering Technology",
      phone: "08163048774",
      avatar: "/placeholder.svg?height=120&width=120",
    },
    {
      id: 4,
      name: "Emmanuel Bright",
      department: "Mechanical Engineering",
      year: "2022",
      faculty: "School of Engineering and Engineering Technology",
      phone: "08163048775",
      avatar: "/placeholder.svg?height=120&width=120",
    },
  ];

  return users.find((user) => user.id === Number.parseInt(id));
};

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;
  const user = getUserById(id);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader title="User Not Found" showBack />
        <div className="p-4 text-center">
          <p className="text-gray-500">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-between p-4 bg-white border-b lg:hidden">
        <Button variant="ghost" size="icon" className="mr-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Button>
        <div className="flex-1"></div>
        <Button variant="ghost" size="icon">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Section */}
        <div className="text-center">
          <Avatar className="w-24 h-24 mx-auto mb-4">
            <AvatarImage src={user.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-gray-200 text-gray-500 text-2xl">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-xl font-semibold mb-1">{user.name}</h1>
          <p className="text-gray-600 mb-1">{user.department}</p>
          <p className="text-gray-600 mb-6">{user.year}</p>

          {/* Action Buttons */}
          <div className="flex space-x-3 justify-center">
            <Button className="bg-red-500 hover:bg-red-600 px-8">
              Connect
            </Button>
            <Button variant="outline" className="px-8 bg-transparent">
              Message
            </Button>
          </div>
        </div>

        {/* Details Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Details</h2>

          <div className="space-y-4">
            {/* Faculty */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mt-1">
                <GraduationCap className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="font-medium">Faculty</p>
                <p className="text-sm text-gray-600">{user.faculty}</p>
              </div>
            </div>

            {/* Department */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mt-1">
                <Building className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="font-medium">Department</p>
                <p className="text-sm text-gray-600">{user.department}</p>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mt-1">
                <Phone className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="font-medium">Phone number</p>
                <p className="text-sm text-gray-600">{user.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
