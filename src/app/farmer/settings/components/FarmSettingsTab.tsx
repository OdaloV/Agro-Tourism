// src/app/farmer/settings/components/FarmSettingsTab.tsx
"use client";

import { useState } from "react";
import { MapPin, Ruler, Calendar, FileText, Home, Users, Video, Save } from "lucide-react";

interface FarmSettingsTabProps {
  farmer?: {
    farm_name: string;
    farm_location: string;
    farm_size: string;
    year_established: number;
    farm_description: string;
    farm_type: string;
    accommodation: boolean;
    max_guests: number;
    video_link: string;
  };
  facilities?: string[];
  onSave: (data: any) => void;
  saving: boolean;
}

const farmTypes = [
  "vegetables", "dairy", "livestock", "mixed", "orchard", "vineyard", "poultry", "fishery"
];

const facilityOptions = [
  "parking", "restrooms", "restaurant", "wifi", "picnic", "camping", "playground", "shop"
];

export default function FarmSettingsTab({ farmer, facilities, onSave, saving }: FarmSettingsTabProps) {
  // Add safety checks for farmer object
  const [formData, setFormData] = useState({
    farm_name: farmer?.farm_name || "",
    farm_location: farmer?.farm_location || "",
    farm_size: farmer?.farm_size || "",
    year_established: farmer?.year_established || "",
    farm_description: farmer?.farm_description || "",
    farm_type: farmer?.farm_type || "",
    accommodation: farmer?.accommodation || false,
    max_guests: farmer?.max_guests || "",
    video_link: farmer?.video_link || "",
  });

  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(facilities || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const toggleFacility = (facility: string) => {
    setSelectedFacilities(prev =>
      prev.includes(facility)
        ? prev.filter(f => f !== facility)
        : [...prev, facility]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Farm Profile</h2>
        <p className="text-sm text-gray-500 mb-6">Update your farm information</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name</label>
          <input
            type="text"
            value={formData.farm_name}
            onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent text-gray-900 bg-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={formData.farm_location}
              onChange={(e) => setFormData({ ...formData, farm_location: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent text-gray-900 bg-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Farm Size (acres)</label>
          <div className="relative">
            <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={formData.farm_size}
              onChange={(e) => setFormData({ ...formData, farm_size: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent text-gray-900 bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year Established</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="number"
              value={formData.year_established}
              onChange={(e) => setFormData({ ...formData, year_established: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent text-gray-900 bg-white"
              placeholder="e.g., 2010"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Farm Description</label>
          <textarea
            rows={4}
            value={formData.farm_description}
            onChange={(e) => setFormData({ ...formData, farm_description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent text-gray-900 bg-white"
            placeholder="Describe your farm, what makes it special..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Farm Type</label>
          <select
            value={formData.farm_type}
            onChange={(e) => setFormData({ ...formData, farm_type: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent text-gray-900 bg-white"
          >
            <option value="">Select farm type</option>
            {farmTypes.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Video Tour Link</label>
          <div className="relative">
            <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="url"
              value={formData.video_link}
              onChange={(e) => setFormData({ ...formData, video_link: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent text-gray-900 bg-white"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </div>
      </div>

      {/* Accommodation */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Accommodation</h3>
        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.accommodation}
              onChange={(e) => setFormData({ ...formData, accommodation: e.target.checked })}
              className="rounded border-gray-300 text-accent focus:ring-accent"
            />
            <span className="text-gray-700">Farm offers accommodation</span>
          </label>
        </div>
        
        {formData.accommodation && (
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Guests</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={formData.max_guests}
                onChange={(e) => setFormData({ ...formData, max_guests: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent text-gray-900 bg-white"
                placeholder="e.g., 20"
              />
            </div>
          </div>
        )}
      </div>

      {/* Facilities */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Facilities</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {facilityOptions.map(facility => (
            <label key={facility} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedFacilities.includes(facility)}
                onChange={() => toggleFacility(facility)}
                className="rounded border-gray-300 text-accent focus:ring-accent"
              />
              <span className="text-gray-700 capitalize">{facility}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}