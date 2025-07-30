"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";
import { MobileHeader } from "@/components/mobile-header";
import { toast } from "sonner"; // or your preferred toast library
import { updateUserProfile } from "@/lib/actions";
import { useSession } from "next-auth/react";
import { image } from "@tensorflow/tfjs";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(
    session?.user?.image || null
  );

  const userId = session?.user?.id || "";
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: session?.user?.mobileNumber || "",
    image: session?.user?.image || null,
    address: session?.user?.address || "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      toast.error("Display name is required");
      return;
    }

    setIsLoading(true);
    try {
      const dataToSend = {
        displayName: formData.name,
        phoneNumber: formData.phone,
        address: formData.address,
        profilePicture: profileImage, // Base64 encoded image or URL
      };

      const response = await updateUserProfile({
        userId: userId,
        displayName: formData.name,
        phoneNumber: formData.phone,
        address: formData.address,
        profilePicture: profileImage,
      });

      if (response.success) {
        toast.success("Profile updated successfully");
        router.push("/profile");
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating your profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="Edit Profile" showBack />

      <div className="p-4 space-y-6 pt-20">
        {/* Profile Image Section */}
        <div className="text-center">
          <div className="relative inline-block">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={profileImage || "/placeholder.svg?height=96&width=96"}
              />
              <AvatarFallback>OC</AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={handleImageClick}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <h2 className="text-lg font-semibold mt-4 mb-1">{formData.name}</h2>
          <p className="text-sm text-gray-600">2022/1456789</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <Label
              htmlFor="name"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              Display Name
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full h-12 bg-white border-gray-200"
              placeholder="Enter your display name"
            />
          </div>

          <div>
            <Label
              htmlFor="phone"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              Phone number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="w-full h-12 bg-white border-gray-200"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <Label
              htmlFor="address"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              Address
            </Label>
            <Input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="w-full h-12 bg-white border-gray-200"
              placeholder="Enter your address"
            />
          </div>
        </div>

        {/* Update Button */}
        <div className="pt-4">
          <Button
            onClick={handleUpdate}
            disabled={isLoading}
            className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-medium"
          >
            {isLoading ? "Updating..." : "Update"}
          </Button>
        </div>
      </div>
    </div>
  );
}
