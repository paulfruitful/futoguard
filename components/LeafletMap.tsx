"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

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

const LeafletMap = ({ users }: Props) => {
  const [location, setLocation] = useState({
    latitude: 6.6224128,
    longitude: 3.3128448,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error watching position:", error);
        },
        { enableHighAccuracy: true, maximumAge: 0 }
      );

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
      <TileLayer
        url="http://www.google.cn/maps/vt?lyrs=m&x={x}&y={y}&z={z}"
        attribution="&copy; Google Maps"
      />

      <ChangeView center={[location.latitude, location.longitude]} />

      {/* Current user location */}
      <Marker
        position={[location.latitude, location.longitude]}
        icon={customIcon}
      >
        <Popup>You are here!</Popup>
      </Marker>

      {/* Other users */}
      {users.map((user) => (
        <Marker key={user.id} position={[user.lat, user.lng]} icon={customIcon}>
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

const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
};

export default LeafletMap;
