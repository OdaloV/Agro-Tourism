// src/app/components/LocationPicker.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css";
import "maplibre-gl/dist/maplibre-gl.css";

// Use a free tile server (OpenStreetMap based)
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
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const geocoderContainerRef = useRef<HTMLDivElement>(null);
  const [address, setAddress] = useState(initialLocation?.address || "");
  const [isSearching, setIsSearching] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initialCenter: [number, number] = initialLocation 
      ? [initialLocation.lng, initialLocation.lat]
      : [36.8219, -1.2921]; // Nairobi coordinates

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: initialCenter,
      zoom: 14,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // Add marker
    marker.current = new maplibregl.Marker({ draggable: true })
      .setLngLat(initialCenter)
      .addTo(map.current);

    // Handle marker drag end
    marker.current.on("dragend", () => {
      const lngLat = marker.current?.getLngLat();
      if (lngLat) {
        reverseGeocode(lngLat.lng, lngLat.lat);
      }
    });

    // Handle map click
    map.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      marker.current?.setLngLat([lng, lat]);
      reverseGeocode(lng, lat);
    });

    // If initial location exists, reverse geocode it
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

    return () => {
      map.current?.remove();
    };
  }, []);

  // Simple search using Nominatim (no external library needed)
  const searchLocation = async (query: string) => {
    if (!query || query.length < 3) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ke&limit=5`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        // Create a simple search dropdown
        const existingDropdown = document.getElementById("location-search-dropdown");
        if (existingDropdown) existingDropdown.remove();
        
        const dropdown = document.createElement("div");
        dropdown.id = "location-search-dropdown";
        dropdown.className = "absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto";
        
        data.forEach((item: any) => {
          const option = document.createElement("button");
          option.className = "w-full text-left px-4 py-2 hover:bg-gray-50 transition text-sm text-gray-700";
          option.textContent = item.display_name;
          option.onclick = () => {
            const lat = parseFloat(item.lat);
            const lon = parseFloat(item.lon);
            marker.current?.setLngLat([lon, lat]);
            map.current?.flyTo({ center: [lon, lat], zoom: 14 });
            reverseGeocode(lon, lat, item.display_name);
            dropdown.remove();
            setAddress(item.display_name);
          };
          dropdown.appendChild(option);
        });
        
        const searchInput = document.getElementById("location-search-input");
        if (searchInput && searchInput.parentNode) {
          searchInput.parentNode.appendChild(dropdown);
        }
      }
    } catch (error) {
      console.error("Error searching location:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    
    // Remove existing dropdown
    const existingDropdown = document.getElementById("location-search-dropdown");
    if (existingDropdown) existingDropdown.remove();
    
    // Search after delay
    const timeoutId = setTimeout(() => {
      if (value.length >= 3) {
        searchLocation(value);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  const reverseGeocode = async (lng: number, lat: number, customAddress?: string) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        const addressText = customAddress || data.display_name;
        setAddress(addressText);
        
        const addressDetails = data.address || {};
        const city = addressDetails.city || addressDetails.town || addressDetails.village || "";
        const region = addressDetails.state || addressDetails.province || "";
        const country = addressDetails.country || "";
        
        onLocationSelect({
          lat,
          lng,
          address: addressText,
          city,
          region,
          country,
        });
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          id="location-search-input"
          type="text"
          value={address}
          onChange={handleSearchChange}
          placeholder="Search for your farm location..."
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-accent text-gray-900"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent"></div>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full h-80 md:h-96 rounded-xl overflow-hidden border border-gray-300"
      />

      {/* Instructions */}
      <div className="text-xs text-gray-500 text-center">
        📍 Drag the pin or click on the map to set your farm location
      </div>
    </div>
  );
}