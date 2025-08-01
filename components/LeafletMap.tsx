"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useContext, useEffect, useState } from "react";
// import { SocketContext } from "./providers/socket";

interface User {
  id: number;
  name: string;
  phone: string;
  lat: number;
  lng: number;
}

interface Props {
  users: User[];
}
const customIcon = new L.Icon({
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [50, 50],
  iconAnchor: [25, 50],
  popupAnchor: [0, -50],
});

const staticUsers = [
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

const user1 = {
  id: 1,
  name: "John Doe",
  phone: "08012345678",
  lat: 5.3811,
  lng: 6.9946,
};
const user2 = {
  id: 2,
  name: "Jane Smith",
  phone: "07098765432",
  lat: 5.380738828438366,
  lng: 6.994848749628269,
};
const user3 = {
  id: 3,
  name: "Mark",
  phone: "0811002003",
  lat: 5.3809,
  lng: 6.9962,
};

const Map = ({ users }: Props) => {
  const [location, setLocation] = useState({
    latitude: 6.6224128,
    longitude: 3.3128448,
  });

  // const { sendPayload, socket } = useContext(SocketContext);

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
        },
        (error) => {
          console.error("Error watching position:", error);
        },
        {
          enableHighAccuracy: true, // More precise tracking
          maximumAge: 0, // Avoid cached positions
          //   timeout: 5000, // Fail if no position is found within 5 seconds
        }
      );

      // Cleanup function to stop watching position when unmounting
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  return (
    <MapContainer
      center={[location.latitude, location.longitude]}
      zoom={18}
      style={{ height: "100vh", width: "100%" }}
      className="z-0 rounded-lg"
    >
      {/* Tile Layer */}
      <TileLayer
        url="http://www.google.cn/maps/vt?lyrs=m&x={x}&y={y}&z={z}"
        attribution="&copy; Google Maps"
      />

      {/* Dynamically update map center */}
      <ChangeView center={[location.latitude, location.longitude]} />

      {/* Marker for user's current location */}
      <Marker
        position={[location.latitude, location.longitude]}
        icon={customIcon}
      >
        <Popup>You are here!</Popup>
      </Marker>

      {/* <Marker position={[user1.lat, user1.lng]} icon={customIcon}>
        <Popup>
          <strong>{user1.name}</strong>
          <br />
          {user1.phone}
        </Popup>
      </Marker>

      <Marker position={[user2.lat, user2.lng]} icon={customIcon}>
        <Popup>
          <strong>{user2.name}</strong>
          <br />
          {user2.phone}
        </Popup>
      </Marker>

      <Marker position={[user3.lat, user3.lng]} icon={customIcon}>
        <Popup>
          <strong>{user3.name}</strong>
          <br />
          {user3.phone}
        </Popup>
      </Marker> */}

      {staticUsers.map((user) => (
        <Marker position={[user.lat, user.lng]} icon={customIcon}>
          <Popup>
            <strong>{user.name}</strong>
            <br />
            {user.phone}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

// Component to update map center dynamically
const ChangeView = ({ center }: any) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
};

export default Map;
