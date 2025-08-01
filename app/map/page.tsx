"use client";

import Map from "@/components/LeafletMap";

const mockUsers = [
  { id: 1, name: "John Doe", phone: "08012345678", lat: 5.3811, lng: 6.9946 },
  {
    id: 2,
    name: "Jane Smith",
    phone: "07098765432",
    lat: 5.380738828438366,
    lng: 6.994848749628269,
  },
  { id: 3, name: "Mark", phone: "0811002003", lat: 5.3809, lng: 6.9962 },
];

export default function MapPage() {
  return <Map users={mockUsers} />;
}
