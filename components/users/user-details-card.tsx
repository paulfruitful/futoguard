import { User } from "@/constants/types";
import {
  Phone,
  GraduationCap,
  Building,
  Mail,
  MapPin,
  Calendar,
} from "lucide-react";

interface UserDetailsCardProps {
  user: User;
}

export function UserDetailsCard({ user }: UserDetailsCardProps) {
  const details = [
    // {
    //   icon: Mail,
    //   label: "Email",
    //   value: user.email,
    //   href: `mailto:${user.email}`,
    // },
    // {
    //   icon: GraduationCap,
    //   label: "Faculty",
    //   value: user.faculty || "School of Engineering and Engineering Technology",
    // },
    {
      icon: Building,
      label: "Department",
      value: user.department,
    },
    {
      icon: Phone,
      label: "Phone number",
      value: user.displayMobileNumber || user.mobileNumber || "Not provided",
      href:
        user.displayMobileNumber || user.mobileNumber
          ? `tel:${user.displayMobileNumber || user.mobileNumber}`
          : undefined,
    },
    {
      icon: MapPin,
      label: "Address",
      value: user.displayAddress || "Not provided",
    },
    {
      icon: Calendar,
      label: "Joined",
      value: formatJoinDate(user.createdAt),
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Details</h2>

      <div className="space-y-4">
        {details.map((detail, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mt-1">
              <detail.icon className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{detail.label}</p>
              {detail.href ? (
                <a
                  href={detail.href}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {detail.value}
                </a>
              ) : (
                <p className="text-sm text-gray-600">{detail.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatJoinDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
