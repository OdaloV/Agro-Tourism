// src/app/farmer/settings/components/FarmSettingsTab.tsx
"use client";

import { useState } from "react";
import { MapPin, Ruler, Calendar, FileText, Home, Users, Video, Save, Users as UsersIcon, Clock, DollarSign, Shield } from "lucide-react";

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
    // Group booking fields
    max_guests_per_booking?: number;
    daily_capacity?: number;
    discount_tier1?: number;
    discount_tier2?: number;
    discount_tier3?: number;
    advance_notice_tier1?: number;
    advance_notice_tier2?: number;
    advance_notice_tier3?: number;
    require_deposit?: boolean;
    require_waiver?: boolean;
    require_coordinator?: boolean;
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
    // Group booking fields
    max_guests_per_booking: farmer?.max_guests_per_booking || 50,
    daily_capacity: farmer?.daily_capacity || 200,
    discount_tier1: farmer?.discount_tier1 || 10,
    discount_tier2: farmer?.discount_tier2 || 15,
    discount_tier3: farmer?.discount_tier3 || 20,
    advance_notice_tier1: farmer?.advance_notice_tier1 || 3,
    advance_notice_tier2: farmer?.advance_notice_tier2 || 7,
    advance_notice_tier3: farmer?.advance_notice_tier3 || 14,
    require_deposit: farmer?.require_deposit || false,
    require_waiver: farmer?.require_waiver || false,
    require_coordinator: farmer?.require_coordinator || false,
  });

  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(facilities || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, facilities: selectedFacilities });
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

      {/* Group Booking Settings */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <UsersIcon className="h-5 w-5 text-accent" />
          Group Booking Settings
        </h3>
        <p className="text-sm text-gray-500 mb-4">Configure settings for large group bookings</p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Guests Per Booking
            </label>
            <input
              type="number"
              value={formData.max_guests_per_booking}
              onChange={(e) => setFormData({ ...formData, max_guests_per_booking: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
              placeholder="e.g., 100"
            />
            <p className="text-xs text-gray-400 mt-1">Maximum number of people allowed per booking</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Daily Capacity
            </label>
            <input
              type="number"
              value={formData.daily_capacity}
              onChange={(e) => setFormData({ ...formData, daily_capacity: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
              placeholder="e.g., 200"
            />
            <p className="text-xs text-gray-400 mt-1">Maximum total guests per day</p>
          </div>
        </div>

        {/* Group Discount Tiers */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-accent" />
            Group Discount Tiers
          </label>
          <div className="space-y-3">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-500">11-20 guests</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.discount_tier1}
                    onChange={(e) => setFormData({ ...formData, discount_tier1: parseInt(e.target.value) })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <span className="text-gray-500">% off</span>
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500">21-50 guests</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.discount_tier2}
                    onChange={(e) => setFormData({ ...formData, discount_tier2: parseInt(e.target.value) })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <span className="text-gray-500">% off</span>
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500">50+ guests</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.discount_tier3}
                    onChange={(e) => setFormData({ ...formData, discount_tier3: parseInt(e.target.value) })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <span className="text-gray-500">% off</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advance Notice Requirements */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent" />
            Advance Notice Required
          </label>
          <div className="space-y-3">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-500">11-20 guests</label>
                <input
                  type="number"
                  value={formData.advance_notice_tier1}
                  onChange={(e) => setFormData({ ...formData, advance_notice_tier1: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-400">days notice required</p>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500">21-50 guests</label>
                <input
                  type="number"
                  value={formData.advance_notice_tier2}
                  onChange={(e) => setFormData({ ...formData, advance_notice_tier2: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-400">days notice required</p>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500">50+ guests</label>
                <input
                  type="number"
                  value={formData.advance_notice_tier3}
                  onChange={(e) => setFormData({ ...formData, advance_notice_tier3: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-400">days notice required</p>
              </div>
            </div>
          </div>
        </div>

        {/* Group Booking Requirements */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-accent" />
            Group Booking Requirements
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.require_deposit}
                onChange={(e) => setFormData({ ...formData, require_deposit: e.target.checked })}
                className="rounded border-gray-300 text-accent"
              />
              <span className="text-sm text-gray-700">Require deposit for 50+ guests (50%)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.require_waiver}
                onChange={(e) => setFormData({ ...formData, require_waiver: e.target.checked })}
                className="rounded border-gray-300 text-accent"
              />
              <span className="text-sm text-gray-700">Require signed waiver for groups</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.require_coordinator}
                onChange={(e) => setFormData({ ...formData, require_coordinator: e.target.checked })}
                className="rounded border-gray-300 text-accent"
              />
              <span className="text-sm text-gray-700">Require group coordinator contact</span>
            </label>
          </div>
        </div>
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