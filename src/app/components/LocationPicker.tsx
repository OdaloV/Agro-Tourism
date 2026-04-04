// src/app/components/LocationPicker.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const VECTOR_STYLE = "https://tiles.openfreemap.org/styles/liberty";

interface LocationPickerProps {
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    region: string;
    country: string;
    district?: string;
    ward?: string;
    neighborhood?: string;
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
  
  // All useState hooks with proper initial values
  const [address, setAddress] = useState<string>(initialLocation?.address || "");
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [geolocating, setGeolocating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [detailedLocation, setDetailedLocation] = useState<any>({
    neighborhood: "",
    ward: "",
    city: "",
    county: "",
    constituency: "",
    fullAddress: ""
  });

  // Get detailed address from coordinates
  const getDetailedAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`,
        {
          headers: {
            'User-Agent': 'HarvestHost/1.0 (https://harvesthost.com)',
          },
        }
      );
      const data = await response.json();
      
      if (data && data.address) {
        const addr = data.address;
        
        const neighborhood = addr.neighbourhood || addr.suburb || "";
        const ward = addr.city_district || addr.district || "";
        const constituency = addr.county || "";
        const city = addr.city || addr.town || addr.village || "";
        const county = addr.state || addr.county || "";
        
        let detailedAddress = "";
        if (neighborhood) detailedAddress += neighborhood;
        if (ward) detailedAddress += detailedAddress ? `, ${ward}` : ward;
        if (city) detailedAddress += detailedAddress ? `, ${city}` : city;
        if (county) detailedAddress += detailedAddress ? `, ${county}` : county;
        if (!detailedAddress) detailedAddress = data.display_name.split(',')[0];
        
        if (!detailedAddress.toLowerCase().includes('kenya')) {
          detailedAddress += `, Kenya`;
        }
        
        return {
          fullAddress: detailedAddress,
          neighborhood: neighborhood,
          ward: ward,
          city: city,
          county: county,
          constituency: constituency,
        };
      }
      return {
        fullAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        neighborhood: "",
        ward: "",
        city: "",
        county: "",
        constituency: ""
      };
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return {
        fullAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        neighborhood: "",
        ward: "",
        city: "",
        county: "",
        constituency: ""
      };
    }
  };

  // Search for locations in Kenya
  const searchLocation = async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=ke&limit=10&addressdetails=1&zoom=18`,
        {
          headers: {
            'User-Agent': 'HarvestHost/1.0 (https://harvesthost.com)',
          },
        }
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        setSearchResults(data);
        setShowResults(true);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error("Error searching location:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  const debounceTimeout = useRef<NodeJS.Timeout>();
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      searchLocation(value);
    }, 500);
  };

  // Select a search result
  const selectSearchResult = async (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    const addr = result.address || {};
    
    const neighborhood = addr.neighbourhood || addr.suburb || "";
    const ward = addr.city_district || addr.district || "";
    const city = addr.city || addr.town || addr.village || "";
    const county = addr.state || addr.county || "";
    
    let detailedAddress = "";
    if (neighborhood) detailedAddress += neighborhood;
    if (ward) detailedAddress += detailedAddress ? `, ${ward}` : ward;
    if (city) detailedAddress += detailedAddress ? `, ${city}` : city;
    if (county) detailedAddress += detailedAddress ? `, ${county}` : county;
    if (!detailedAddress) detailedAddress = result.display_name.split(',')[0];
    
    setAddress(detailedAddress);
    setSearchQuery(detailedAddress);
    setShowResults(false);
    
    setDetailedLocation({
      neighborhood,
      ward,
      city,
      county,
      constituency: "",
      fullAddress: detailedAddress
    });
    
    if (map.current) {
      map.current.flyTo({ center: [lon, lat], zoom: 16 });
      
      if (marker.current) {
        marker.current.setLngLat([lon, lat]);
      }
      
      onLocationSelect({
        lat,
        lng: lon,
        address: detailedAddress,
        city: city,
        region: county,
        country: "Kenya",
        district: ward,
        ward: neighborhood,
      });
    }
  };

  // Update location with detailed address
  const updateLocation = async (lat: number, lng: number) => {
    const detailed = await getDetailedAddress(lat, lng);
    setAddress(detailed.fullAddress);
    setSearchQuery(detailed.fullAddress);
    setDetailedLocation({
      neighborhood: detailed.neighborhood,
      ward: detailed.ward,
      city: detailed.city,
      county: detailed.county,
      constituency: detailed.constituency,
      fullAddress: detailed.fullAddress
    });
    
    onLocationSelect({
      lat,
      lng,
      address: detailed.fullAddress,
      city: detailed.city,
      region: detailed.county,
      country: "Kenya",
      district: detailed.ward,
      ward: detailed.neighborhood,
    });
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const container = mapContainer.current;
    
    function initMap() {
      try {
        const initialCenter: [number, number] = initialLocation 
          ? [initialLocation.lng, initialLocation.lat]
          : [36.8219, -1.2921];

        map.current = new maplibregl.Map({
          container: container,
          style: VECTOR_STYLE,
          center: initialCenter,
          zoom: 14,
          fadeDuration: 0,
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
        map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');

        map.current.on("load", () => {
          console.log("Map loaded successfully");
          setMapLoaded(true);
          setError(null);
          
          const el = document.createElement('div');
          el.className = 'custom-marker';
          el.innerHTML = `
            <div style="
              width: 30px;
              height: 30px;
              background-color: #EAB308;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              cursor: pointer;
            "></div>
          `;
          
          marker.current = new maplibregl.Marker({ 
            draggable: true,
            element: el
          })
            .setLngLat(initialCenter)
            .addTo(map.current);
          
          marker.current.on("dragend", async () => {
            const lngLat = marker.current.getLngLat();
            if (lngLat) {
              await updateLocation(lngLat.lat, lngLat.lng);
            }
          });
          
          map.current.on("click", async (e: any) => {
            const { lng, lat } = e.lngLat;
            marker.current.setLngLat([lng, lat]);
            await updateLocation(lat, lng);
          });
        });

        map.current.on("error", (e: any) => {
          console.error("Map error:", e);
          setError("Failed to load map.");
        });

        if (initialLocation?.address) {
          setAddress(initialLocation.address);
          setSearchQuery(initialLocation.address);
          onLocationSelect({
            lat: initialLocation.lat,
            lng: initialLocation.lng,
            address: initialLocation.address,
            city: "",
            region: "",
            country: "Kenya",
          });
        }
      } catch (err) {
        console.error("Error initializing map:", err);
        setError("Failed to initialize map");
      }
    }

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
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

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        if (map.current) {
          map.current.flyTo({ center: [longitude, latitude], zoom: 16 });
          
          if (marker.current) {
            marker.current.setLngLat([longitude, latitude]);
          }
          
          await updateLocation(latitude, longitude);
        }
        setGeolocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Unable to get your location. ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Please allow location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out.";
            break;
        }
        alert(errorMessage);
        setGeolocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search Location
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for Migosi, Kisumu, Nairobi, Kiambu..."
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-gray-900"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent"></div>
            </div>
          )}
          
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((result, idx) => {
                const addr = result.address || {};
                const neighborhood = addr.neighbourhood || addr.suburb || "";
                const ward = addr.city_district || addr.district || "";
                const city = addr.city || addr.town || addr.village || "";
                const county = addr.state || addr.county || "";
                
                let displayName = "";
                if (neighborhood) displayName = neighborhood;
                else if (ward) displayName = ward;
                else if (city) displayName = city;
                else if (county) displayName = county;
                
                let subText = "";
                if (ward && ward !== displayName) subText = ward;
                else if (city && city !== displayName) subText = city;
                if (county) subText += subText ? `, ${county}` : county;
                
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectSearchResult(result)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-0"
                  >
                    <div className="font-medium text-gray-900">{displayName}</div>
                    {subText && <div className="text-xs text-gray-500 mt-0.5">{subText}</div>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Address Display */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Farm Address
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Detailed farm address will appear here"
            className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-gray-900"
          />
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={geolocating}
            className="px-4 py-3 bg-accent text-white rounded-xl hover:bg-accent/90 transition disabled:opacity-50 flex items-center gap-2"
          >
            {geolocating ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <span>🎯</span>
                <span className="hidden sm:inline">Current</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Location Details */}
      {detailedLocation.neighborhood && (
        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
          <div className="font-medium text-gray-700 mb-1">📍 Location Details:</div>
          {detailedLocation.neighborhood && <div>🏘️ Area: {detailedLocation.neighborhood}</div>}
          {detailedLocation.ward && <div>📍 Ward: {detailedLocation.ward}</div>}
          {detailedLocation.city && <div>🏙️ City/Town: {detailedLocation.city}</div>}
          {detailedLocation.county && <div>🗺️ County: {detailedLocation.county}</div>}
        </div>
      )}

      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full rounded-xl overflow-hidden border border-gray-300 shadow-sm"
        style={{ width: "100%", height: "400px", minHeight: "400px" }}
      />

      {error && (
        <div className="text-center text-red-600 text-sm p-3 bg-red-50 rounded-lg border border-red-200">
          ⚠️ {error}
        </div>
      )}

      {!mapLoaded && !error && (
        <div className="text-center text-gray-500 text-sm py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto mb-2"></div>
          Loading map...
        </div>
      )}

      {mapLoaded && (
        <div className="text-xs text-gray-500 text-center space-y-1 p-3 bg-gray-50 rounded-lg">
          <div>📍 Click map, drag pin, or use "Current" button for GPS location</div>
          <div>🔍 Search for specific areas like "Migosi", "Kisumu", "Westlands"</div>
          <div className="text-emerald-600 mt-1">✓ Detailed area name will be saved automatically</div>
        </div>
      )}
    </div>
  );
}