// src/app/components/LocationPicker.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Use a free tile server that works without API key
const MAP_STYLE = "https://tiles.stadiamaps.com/styles/outdoors.json";

interface LocationPickerProps {
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    region: string;
    country: string;
  }) => void;
  initialLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export default function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const [address, setAddress] = useState(initialLocation?.address || "");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Make sure the container has dimensions
    const container = mapContainer.current;
    const rect = container.getBoundingClientRect();
    
    if (rect.width === 0 || rect.height === 0) {
      console.log("Container has zero dimensions, waiting...");
      // Wait for container to have dimensions
      const observer = new ResizeObserver(() => {
        const newRect = container.getBoundingClientRect();
        if (newRect.width > 0 && newRect.height > 0) {
          observer.disconnect();
          initMap();
        }
      });
      observer.observe(container);
      return () => observer.disconnect();
    } else {
      initMap();
    }

    function initMap() {
      try {
        const initialCenter: [number, number] = initialLocation 
          ? [initialLocation.lng, initialLocation.lat]
          : [36.8219, -1.2921];

        console.log("Creating map with center:", initialCenter);
        console.log("Container dimensions:", container.clientWidth, "x", container.clientHeight);

        map.current = new maplibregl.Map({
          container: container,
          style: MAP_STYLE,
          center: initialCenter,
          zoom: 14,
        });

        map.current.on("load", () => {
          console.log("Map loaded successfully");
          setMapLoaded(true);
          setError(null);
          
          // Add navigation controls
          map.current.addControl(new maplibregl.NavigationControl(), "top-right");
          
          // Add marker
          marker.current = new maplibregl.Marker({ draggable: true })
            .setLngLat(initialCenter)
            .addTo(map.current);
          
          // Handle marker drag end
          marker.current.on("dragend", () => {
            const lngLat = marker.current.getLngLat();
            if (lngLat) {
              const addressText = `${lngLat.lat.toFixed(6)}, ${lngLat.lng.toFixed(6)}`;
              setAddress(addressText);
              onLocationSelect({
                lat: lngLat.lat,
                lng: lngLat.lng,
                address: addressText,
                city: "",
                region: "",
                country: "",
              });
            }
          });
          
          // Handle map click
          map.current.on("click", (e: any) => {
            const { lng, lat } = e.lngLat;
            marker.current.setLngLat([lng, lat]);
            const addressText = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            setAddress(addressText);
            onLocationSelect({
              lat,
              lng,
              address: addressText,
              city: "",
              region: "",
              country: "",
            });
          });
        });

        map.current.on("error", (e: any) => {
          console.error("Map error:", e);
          setError("Failed to load map. Please refresh and try again.");
        });

        if (initialLocation?.address) {
          setAddress(initialLocation.address);
          onLocationSelect({
            lat: initialLocation.lat,
            lng: initialLocation.lng,
            address: initialLocation.address,
            city: "",
            region: "",
            country: "",
          });
        }
      } catch (err) {
        console.error("Error initializing map:", err);
        setError("Failed to initialize map");
      }
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    
    if (marker.current && map.current) {
      const center = map.current.getCenter();
      onLocationSelect({
        lat: center.lat,
        lng: center.lng,
        address: value,
        city: "",
        region: "",
        country: "",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Address Input */}
      <div>
        <input
          type="text"
          value={address}
          onChange={handleAddressChange}
          placeholder="Enter your farm address (e.g., Kiambu, Kenya)"
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-accent text-gray-900"
        />
        <p className="text-xs text-gray-400 mt-1">
          Enter your farm address manually, then adjust the pin on the map
        </p>
      </div>

      {/* Map Container with explicit dimensions */}
      <div 
        ref={mapContainer} 
        className="w-full rounded-xl overflow-hidden border border-gray-300 bg-gray-100"
        style={{ width: "100%", height: "400px", minHeight: "400px" }}
      />

      {error && (
        <div className="text-center text-red-500 text-sm p-2 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      {!mapLoaded && !error && (
        <div className="text-center text-gray-500 text-sm">
          Loading map...
        </div>
      )}

      {mapLoaded && (
        <div className="text-xs text-gray-500 text-center">
          📍 Drag the pin or click on the map to set your exact farm location
        </div>
      )}
    </div>
  );
}